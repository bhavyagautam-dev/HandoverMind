from django.db import models
from django.contrib.auth.models import User


class Patient(models.Model):
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    patient_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    room_number = models.CharField(max_length=20)

    diagnosis = models.TextField(blank=True)
    allergies = models.TextField(blank=True)

    admission_date = models.DateField()

    assigned_nurse = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_patients"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_id} - {self.name}"


class Handoff(models.Model):
    RISK_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
        ("Critical", "Critical"),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="handoffs"
    )

    nurse = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="handoffs"
    )

    input_text = models.TextField()

    sbar_summary = models.TextField(blank=True)

    risk_level = models.CharField(
        max_length=20,
        choices=RISK_CHOICES,
        default="Low"
    )

    status = models.CharField(
        max_length=20,
        default="Draft"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient.name} - {self.nurse.username}"