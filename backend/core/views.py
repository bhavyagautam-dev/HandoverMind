from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .permissions import IsAdmin, IsNurse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Patient,Handoff
from .serializers import PatientSerializer,HandoffSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # User role
        if user.groups.filter(name="Admin").exists():
            role = "Admin"
        elif user.groups.filter(name="Nurse").exists():
            role = "Nurse"
        else:
            role = "User"

        token["role"] = role
        token["username"] = user.username

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        if self.user.groups.filter(name="Admin").exists():
            role = "Admin"
        elif self.user.groups.filter(name="Nurse").exists():
            role = "Nurse"
        else:
            role = "User"

        data["user"] = {
            "username": self.user.username,
            "role": role
        }

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class AdminTestView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            "message": "Admin API accessed successfully",
            "user": request.user.username
        })


class NurseTestView(APIView):
    permission_classes = [IsNurse]

    def get(self, request):
        return Response({
            "message": "Nurse API accessed successfully",
            "user": request.user.username
        })


class PatientListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.groups.filter(name="Nurse").exists():
            patients = Patient.objects.filter(
                assigned_nurse=request.user
            ).order_by("-created_at")
        else:
            patients = Patient.objects.all().order_by("-created_at")

        serializer = PatientSerializer(
            patients,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = PatientSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class PatientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):

        try:
            patient = Patient.objects.get(
                id=patient_id
            )
        except Patient.DoesNotExist:
            return Response(
                {"detail": "Patient not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Nurse sirf apne assigned patient ko dekh sakti hai
        if request.user.groups.filter(name="Nurse").exists():
            if patient.assigned_nurse != request.user:
                return Response(
                    {"detail": "You do not have access to this patient."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = PatientSerializer(patient)

        return Response(serializer.data)



class HandoffListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        handoffs = Handoff.objects.filter(
            nurse=request.user
        ).order_by("-created_at")

        serializer = HandoffSerializer(
            handoffs,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = HandoffSerializer(
            data=request.data
        )

        if serializer.is_valid():
            patient = serializer.validated_data["patient"]

            # Nurse can only create handoff
            # for their assigned patient
            if (
                request.user.groups.filter(name="Nurse").exists()
                and patient.assigned_nurse != request.user
            ):
                return Response(
                    {"detail": "You do not have access to this patient."},
                    status=status.HTTP_403_FORBIDDEN
                )

            handoff = serializer.save(
                nurse=request.user
            )

            return Response(
                HandoffSerializer(handoff).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )