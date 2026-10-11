from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import Patient, Handoff

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        

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
        if nurse is None:
            return nurse

        if not nurse.groups.filter(name="Nurse").exists():
            raise serializers.ValidationError(
                "Patient can only be assigned to a user in the Nurse group."
            )

        return nurse
    def validate_assigned_nurse(self, nurse):
        if nurse is None:
            return nurse

        if not nurse.groups.filter(name="Nurse").exists():
            raise serializers.ValidationError(
                "Patient can only be assigned to a user in the Nurse group."
            )
        return nurse
class NurseCreateSerializer(serializers.ModelSerializer):
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

    def create(self, validated_data):
        password = validated_data.pop("password")

        nurse = User.objects.create_user(
            password=password,
            **validated_data
        )

        nurse_group, _ = Group.objects.get_or_create(
            name="Nurse"
        )
        nurse.groups.add(nurse_group)

        return nurse


class StaffCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
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
        read_only=True
    )

    room_number = serializers.CharField(
        source="patient.room_number",
        read_only=True
    )

    class Meta:
        model = Handoff
        fields = [
            "id",
            "patient",
            "patient_name",
            "room_number",
            "nurse",
            "input_text",
            "sbar_summary",
            "risk_level",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "room_number",
            "nurse",
            "sbar_summary",
            "risk_level",
            "created_at",
            "updated_at",
        ]