from django.utils import timezone
from django.contrib.auth.models import User, Group

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Patient, Handoff
from .serializers import PatientSerializer, HandoffSerializer, NurseCreateSerializer,StaffCreateSerializer
from .permissions import IsAdmin, IsNurse, IsManager, IsNonMedicalStaff

from .ai_service import generate_sbar_summary


from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.response import Response

from .models import Patient, Handoff

from django.utils import timezone
from django.contrib.auth import get_user_model



from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .serializers import (
    PatientSerializer,
    HandoffSerializer,
    NurseCreateSerializer,
    StaffCreateSerializer,
)

User = get_user_model()

User = get_user_model()


# JWT LOGIN


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        if user.groups.filter(name="Manager").exists():
            role = "Manager"
        elif user.groups.filter(name="Non-medical Staff").exists():
            role = "Non-medical Staff"
        elif user.groups.filter(name="Nurse").exists():
            role = "Nurse"
        elif user.groups.filter(name="Admin").exists():
            role = "Admin"
        else:
            role = "User"

        token["role"] = role
        token["username"] = user.username

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        if self.user.groups.filter(name="Manager").exists():
            role = "Manager"
        elif self.user.groups.filter(name="Non-medical Staff").exists():
            role = "Non-medical Staff"
        elif self.user.groups.filter(name="Nurse").exists():
            role = "Nurse"
        elif self.user.groups.filter(name="Admin").exists():
            role = "Admin"
        else:
            role = "User"

        data["user"] = {
            "username": self.user.username,
            "role": role,
        }

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



# ROLE TEST APIs

class AdminTestView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            "message": "Admin API accessed successfully",
            "user": request.user.username,
        })


class NurseTestView(APIView):
    permission_classes = [IsNurse]

    def get(self, request):
        return Response({
            "message": "Nurse API accessed successfully",
            "user": request.user.username,
        })


# PATIENT LIST AND CREATE



class PatientListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        is_non_medical = request.user.groups.filter(
            name="Non-medical Staff"
        ).exists()

        is_nurse = request.user.groups.filter(
            name="Nurse"
        ).exists()

        if is_nurse:
            patients = Patient.objects.filter(
                assigned_nurse=request.user,
                status="Active",
            ).order_by("-created_at")

        elif is_manager or is_non_medical:
            patients = Patient.objects.all().order_by("-created_at")

        else:
            return Response(
                {"detail": "You do not have permission to view patients."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)

    def post(self, request):
        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        is_non_medical = request.user.groups.filter(
            name="Non-medical Staff"
        ).exists()

        if not (is_manager or is_non_medical):
            return Response(
                {"detail": "Only management staff can add patients."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Non-medical Staff cannot assign a nurse.
        if not is_manager and request.data.get("assigned_nurse"):
            return Response(
                {
                    "detail": (
                        "Only Manager can assign patients to nurses."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PatientSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )




class NurseManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        if not is_manager:
            return Response(
                {"detail": "Only Manager can manage nurses."},
                status=status.HTTP_403_FORBIDDEN,
            )

        nurses = User.objects.filter(
            groups__name="Nurse",
            is_active=True,
        ).distinct().order_by("username")

        data = [
            {
                "id": nurse.id,
                "username": nurse.username,
                "first_name": nurse.first_name,
                "last_name": nurse.last_name,
            }
            for nurse in nurses
        ]

        return Response(data)

    def post(self, request):
        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        if not is_manager:
            return Response(
                {"detail": "Only Manager can create nurses."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = NurseCreateSerializer(data=request.data)

        if serializer.is_valid():
            nurse = serializer.save()

            return Response(
                {
                    "message": "Nurse created successfully.",
                    "id": nurse.id,
                    "username": nurse.username,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )



    def delete(self, request, nurse_id):
        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        if not is_manager:
            return Response(
                {"detail": "Only Manager can deactivate nurses."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            nurse = User.objects.get(
                id=nurse_id,
                groups__name="Nurse",
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "Nurse not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not nurse.is_active:
            return Response(
                {"detail": "Nurse is already deactivated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent deactivating a nurse who still has active patients.
        if Patient.objects.filter(
            assigned_nurse=nurse,
            status="Active",
        ).exists():
            return Response(
                {
                    "detail": (
                        "Reassign this nurse's active patients "
                        "before deactivating the account."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        nurse.is_active = False
        nurse.save(update_fields=["is_active"])

        return Response(
            {"message": "Nurse deactivated successfully."},
            status=status.HTTP_200_OK,
        )

# PATIENT DETAILS, EDIT, DISCHARGE



class PatientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {"detail": "Patient not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        is_non_medical = request.user.groups.filter(
            name="Non-medical Staff"
        ).exists()

        is_nurse = request.user.groups.filter(
            name="Nurse"
        ).exists()

        if is_nurse:
            if (
                patient.assigned_nurse != request.user
                or patient.status != "Active"
            ):
                return Response(
                    {"detail": "You do not have access to this patient."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        elif not (is_manager or is_non_medical):
            return Response(
                {"detail": "You do not have permission to view this patient."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    def put(self, request, patient_id):
        return self.update_patient(request, patient_id)

    def patch(self, request, patient_id):
        return self.update_patient(request, patient_id)

    def update_patient(self, request, patient_id):
        if not self.is_management_staff(request):
            return Response(
                {"detail": "You do not have permission to edit patients."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {"detail": "Patient not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if patient.status == "Discharged":
            return Response(
                {"detail": "Discharged patients cannot be edited."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only Manager can assign or reassign a nurse.
        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        if not is_manager and "assigned_nurse" in request.data:
            return Response(
                {
                    "detail": (
                        "Only Manager can assign or reassign "
                        "patients to nurses."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PatientSerializer(
            patient,
            data=request.data,
            partial=(request.method == "PATCH"),
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def post(self, request, patient_id):
        if request.data.get("action") != "discharge":
            return Response(
                {"detail": "Invalid action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not self.is_management_staff(request):
            return Response(
                {
                    "detail": (
                        "You do not have permission to discharge patients."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {"detail": "Patient not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if patient.status == "Discharged":
            return Response(
                {"detail": "Patient is already discharged."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        patient.status = "Discharged"
        patient.discharge_date = timezone.localdate()
        patient.save(update_fields=["status", "discharge_date"])

        return Response({
            "message": "Patient discharged successfully.",
            "patient_id": patient.patient_id,
            "status": patient.status,
            "discharge_date": patient.discharge_date,
        })

    @staticmethod
    def is_management_staff(request):
        return (
            request.user.groups.filter(name="Manager").exists()
            or request.user.groups.filter(
                name="Non-medical Staff"
            ).exists()
        )


#Change The Nurse

def select_next_nurse(current_nurse, patient):
    """
    Select a different active Nurse with the lowest active-patient
    workload. Return None if no eligible nurse is available.
    """
    candidates = (
        User.objects.filter(
            is_active=True,
            groups__name__iexact="Nurse",
        )
        .exclude(pk=current_nurse.pk)
        .annotate(
            active_patient_count=Count(
                "assigned_patients",
                filter=Q(assigned_patients__status="Active"),
                distinct=True,
            )
        )
        .order_by("active_patient_count", "id")
        .distinct()
    )

    return candidates.first()


# HANDOFF LIST AND CREATE




class HandoffListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.groups.filter(name="Nurse").exists():
            return Response(
                {"detail": "Only nurses can access handoff history."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Preserve outgoing nurse's own history.
        handoffs = Handoff.objects.filter(
            nurse=request.user
        ).select_related(
            "patient", "nurse", "incoming_nurse"
        ).order_by("-created_at")

        return Response(HandoffSerializer(handoffs, many=True).data)

    def post(self, request):
        if not request.user.groups.filter(name="Nurse").exists():
            return Response(
                {"detail": "Only nurses can create handoffs."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = HandoffSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        patient = serializer.validated_data["patient"]

        with transaction.atomic():
            locked_patient = Patient.objects.select_for_update().get(
                pk=patient.pk
            )

            if locked_patient.status != "Active":
                return Response(
                    {"detail": "Discharged patients cannot receive new handoffs."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if locked_patient.assigned_nurse_id != request.user.id:
                return Response(
                    {"detail": "You do not have access to this patient."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            handoff = serializer.save(
                nurse=request.user,
                patient=locked_patient,
            )

            reassignment = {
                "reassigned": False,
                "incoming_nurse_id": None,
                "incoming_nurse_username": None,
                "message": "Draft saved. Patient assignment unchanged.",
            }

            if handoff.status == "Submitted":
                next_nurse = select_next_nurse(
                    request.user,
                    locked_patient,
                )

                if next_nurse is not None:
                    locked_patient.assigned_nurse = next_nurse
                    locked_patient.save(update_fields=["assigned_nurse"])

                    handoff.incoming_nurse = next_nurse
                    handoff.save(update_fields=["incoming_nurse", "updated_at"])

                    reassignment = {
                        "reassigned": True,
                        "incoming_nurse_id": next_nurse.id,
                        "incoming_nurse_username": next_nurse.username,
                        "message": "Patient reassigned and handoff sent successfully.",
                    }
                else:
                    reassignment["message"] = (
                        "Handoff submitted, but no eligible incoming nurse "
                        "was found. Patient assignment remains unchanged."
                    )

            response_data = HandoffSerializer(handoff).data
            response_data["reassignment"] = reassignment

        return Response(response_data, status=status.HTTP_201_CREATED)


class IncomingHandoffInboxView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.groups.filter(name="Nurse").exists():
            return Response(
                {"detail": "Only nurses can access the incoming handoff inbox."},
                status=status.HTTP_403_FORBIDDEN,
            )

        handoffs = Handoff.objects.filter(
            incoming_nurse=request.user,
            status__in=["Submitted", "Acknowledged"],
        ).select_related(
            "patient", "nurse", "incoming_nurse"
        ).order_by("-created_at")

        return Response(HandoffSerializer(handoffs, many=True).data)



class AcknowledgeHandoffView(APIView):
    permission_classes = [IsAuthenticated, IsNurse]

    def post(self, request, handoff_id):
        from django.utils import timezone
        from django.db import transaction

        with transaction.atomic():
            try:
                handoff = Handoff.objects.select_for_update().get(
                    id=handoff_id,
                    incoming_nurse=request.user,
                )
            except Handoff.DoesNotExist:
                return Response(
                    {"detail": "Incoming handoff not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if handoff.status == "Acknowledged":
                return Response(HandoffSerializer(handoff).data)

            if handoff.status != "Submitted":
                return Response(
                    {"detail": "Only submitted handoffs can be acknowledged."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            handoff.status = "Acknowledged"
            handoff.acknowledged_at = timezone.now()
            handoff.save(
                update_fields=[
                    "status",
                    "acknowledged_at",
                    "updated_at",
                ]
            )

        return Response(HandoffSerializer(handoff).data)

    
#Generate SBAR View

class GenerateSBARView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only nurses can generate handoff summaries
        if not request.user.groups.filter(name="Nurse").exists():
            return Response(
                {"detail": "Only nurses can generate handoff summaries."},
                status=status.HTTP_403_FORBIDDEN,
            )

        patient_id = request.data.get("patient")
        notes = request.data.get("input_text", "").strip()

        if not patient_id or not notes:
            return Response(
                {"detail": "Patient and handoff notes are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(notes) > 10000:
            return Response(
                {"detail": "Notes must be 10,000 characters or fewer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            patient = Patient.objects.get(pk=patient_id)
        except (Patient.DoesNotExist, ValueError, TypeError):
            return Response(
                {"detail": "Patient not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if patient.status != "Active":
            return Response(
                {"detail": "Discharged patients cannot receive new handoffs."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if patient.assigned_nurse_id != request.user.id:
            return Response(
                {"detail": "You do not have access to this patient."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            result = generate_sbar_summary(notes)
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            import logging
            logging.exception("SBAR generation failed")

            return Response(
                {
                    "detail": f"SBAR generation failed: {str(e)}"
                },
                status=status.HTTP_502_BAD_GATEWAY,
    )




# HANDOFF DETAILS


class HandoffDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, handoff_id):
        if not request.user.groups.filter(name="Nurse").exists():
            return Response(
                {"detail": "Only nurses can access handoff details."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            handoff = Handoff.objects.select_related(
                "patient", "nurse", "incoming_nurse"
            ).get(pk=handoff_id)
        except Handoff.DoesNotExist:
            return Response(
                {"detail": "Handoff not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the outgoing or assigned incoming nurse can view it.
        if (
            handoff.nurse_id != request.user.id
            and handoff.incoming_nurse_id != request.user.id
        ):
            return Response(
                {"detail": "You do not have access to this handoff."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(HandoffSerializer(handoff).data)



class StaffManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        if not is_manager:
            return Response(
                {"detail": "Only Manager can manage staff."},
                status=status.HTTP_403_FORBIDDEN,
            )

        staff_members = User.objects.filter(
            groups__name="Non-medical Staff",
            is_active=True,
        ).distinct().order_by("username")

        data = [
            {
                "id": staff.id,
                "username": staff.username,
                "first_name": staff.first_name,
                "last_name": staff.last_name,
            }
            for staff in staff_members
        ]

        return Response(data)

    def post(self, request):
        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        if not is_manager:
            return Response(
                {"detail": "Only Manager can create staff accounts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = StaffCreateSerializer(data=request.data)

        if serializer.is_valid():
            staff = serializer.save()

            return Response(
                {
                    "message": "Staff account created successfully.",
                    "id": staff.id,
                    "username": staff.username,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    def delete(self, request, staff_id):
        is_manager = request.user.groups.filter(
            name="Manager"
        ).exists()

        if not is_manager:
            return Response(
                {"detail": "Only Manager can deactivate staff."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            staff = User.objects.get(
                id=staff_id,
                groups__name="Non-medical Staff",
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "Staff account not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not staff.is_active:
            return Response(
                {"detail": "Staff account is already deactivated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        staff.is_active = False
        staff.save(update_fields=["is_active"])

        return Response(
            {"message": "Staff account deactivated successfully."},
            status=status.HTTP_200_OK,
        )
