
from django.contrib.auth.models import User, Group
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

from rest_framework import serializers

from .models import (
    Patient,
    Handoff,
    Hospital,
    UserProfile,
)



# PATIENT SERIALIZER


class PatientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Patient

        fields = [
            "id",
            "patient_id",
            "name",
            "age",
            "gender",
            "room_number",
            "diagnosis",
            "allergies",
            "admission_date",
            "assigned_nurse",
            "status",
            "discharge_date",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "patient_id",
            "admission_date",
            "status",
            "discharge_date",
            "created_at",
        ]

    def validate_assigned_nurse(self, nurse):

        if nurse is None:
            return nurse

        if not nurse.groups.filter(name="Nurse").exists():
            raise serializers.ValidationError(
                "Patient can only be assigned to a Nurse."
            )

        hospital = self.context.get("hospital")

        if hospital:
            try:
                nurse_hospital_id = nurse.profile.hospital_id

            except UserProfile.DoesNotExist:
                raise serializers.ValidationError(
                    "Nurse hospital profile not found."
                )

            if nurse_hospital_id != hospital.id:
                raise serializers.ValidationError(
                    "Nurse must belong to your hospital."
                )

            if not nurse.is_active:
                raise serializers.ValidationError(
                    "Cannot assign a patient to an inactive nurse."
                )

        return nurse


# NURSE CREATE SERIALIZER



class NurseCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "password"]

    def create(self, validated_data):
        hospital = validated_data.pop("hospital")
        password = validated_data.pop("password")

        nurse = User.objects.create_user(
            password=password,
            **validated_data
        )

        nurse_group, _ = Group.objects.get_or_create(name="Nurse")
        nurse.groups.add(nurse_group)

        UserProfile.objects.create(
            user=nurse,
            hospital=hospital,
            role="Nurse"
        )

        return nurse


# STAFF CREATE SERIALIZER


class StaffCreateSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "password",
        ]

        read_only_fields = ["id"]

    @transaction.atomic
    def create(self, validated_data):

        hospital = validated_data.pop("hospital")
        password = validated_data.pop("password")

        staff = User.objects.create_user(
            password=password,
            **validated_data
        )

        staff_group, _ = Group.objects.get_or_create(
            name="Non-medical Staff"
        )

        staff.groups.add(staff_group)

        UserProfile.objects.create(
            user=staff,
            hospital=hospital,
            role="Non-medical Staff",
        )

        return staff


# ==========================================
# HANDOFF SERIALIZER
# ==========================================

class HandoffSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.name",
        read_only=True,
    )

    patient_id = serializers.CharField(
        source="patient.patient_id",
        read_only=True,
    )

    room_number = serializers.CharField(
        source="patient.room_number",
        read_only=True,
    )

    diagnosis = serializers.CharField(
        source="patient.diagnosis",
        read_only=True,
    )

    allergies = serializers.CharField(
        source="patient.allergies",
        read_only=True,
    )

    outgoing_nurse_username = serializers.CharField(
        source="nurse.username",
        read_only=True,
    )

    incoming_nurse_username = serializers.CharField(
        source="incoming_nurse.username",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Handoff

        fields = [
            "id",
            "patient",
            "patient_name",
            "patient_id",
            "room_number",
            "diagnosis",
            "allergies",
            "nurse",
            "outgoing_nurse_username",
            "incoming_nurse",
            "incoming_nurse_username",
            "input_text",
            "sbar_summary",
            "risk_level",
            "status",
            "acknowledged_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "patient_id",
            "room_number",
            "diagnosis",
            "allergies",
            "nurse",
            "outgoing_nurse_username",
            "incoming_nurse",
            "incoming_nurse_username",
            "acknowledged_at",
            "created_at",
            "updated_at",
        ]

    def validate_status(self, value):

        if value not in ["Draft", "Submitted"]:
            raise serializers.ValidationError(
                "Status must be Draft or Submitted."
            )

        return value



# HOSPITAL REGISTRATION SERIALIZER


class HospitalRegistrationSerializer(serializers.Serializer):

    hospital_name = serializers.CharField(
        max_length=200
    )

    city = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True
    )

    username = serializers.CharField(
        max_length=150
    )

    email = serializers.EmailField()

    first_name = serializers.CharField(
        max_length=150
    )

    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True
    )

    password = serializers.CharField(
        write_only=True
    )

    def validate_username(self, value):

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )

        return value

    def validate_email(self, value):

        if User.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )

        return value

    def validate_password(self, value):

        try:
            validate_password(value)

        except ValidationError as error:
            raise serializers.ValidationError(
                error.messages
            )

        return value

    def validate(self, attrs):

        if Hospital.objects.filter(
            name__iexact=attrs["hospital_name"],
            city__iexact=attrs.get("city", ""),
        ).exists():

            raise serializers.ValidationError({
                "hospital_name": (
                    "This hospital is already registered in this city."
                )
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):

        hospital_name = validated_data.pop("hospital_name")

        city = validated_data.pop(
            "city",
            ""
        )

        password = validated_data.pop("password")

        hospital = Hospital.objects.create(
            name=hospital_name,
            city=city,
        )

        manager = User.objects.create_user(
            password=password,
            **validated_data
        )

        manager_group, _ = Group.objects.get_or_create(
            name="Manager"
        )

        manager.groups.add(manager_group)

        UserProfile.objects.create(
            user=manager,
            hospital=hospital,
            role="Manager",
        )

        return {
            "hospital": hospital,
            "manager": manager,
        }
