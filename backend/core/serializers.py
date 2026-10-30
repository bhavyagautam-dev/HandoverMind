from django.contrib.auth.models import User, Group
from rest_framework import serializers

from .models import Patient, Handoff


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
            "created_at",
            "status",
            "discharge_date",
        ]

    def validate_assigned_nurse(self, nurse):
        if nurse is not None and not nurse.groups.filter(
            name="Nurse"
        ).exists():
            raise serializers.ValidationError(
                "Patient can only be assigned to a user in the Nurse group."
            )
        return nurse


class NurseCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        nurse = User.objects.create_user(
            password=password,
            **validated_data,
        )

        nurse_group, _ = Group.objects.get_or_create(name="Nurse")
        nurse.groups.add(nurse_group)

        return nurse


class StaffCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        staff = User.objects.create_user(
            password=password,
            **validated_data,
        )

        staff_group, _ = Group.objects.get_or_create(
            name="Non-medical Staff"
        )
        staff.groups.add(staff_group)

        return staff


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