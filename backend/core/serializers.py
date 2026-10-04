from rest_framework import serializers
from .models import Patient
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
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


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