
from django.db import models
from django.contrib.auth.models import User


class Patient(models.Model):
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Discharged", "Discharged"),
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
        related_name="assigned_patients",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Active",
    )

    discharge_date = models.DateField(null=True, blank=True)
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

    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Submitted", "Submitted"),
        ("Acknowledged", "Acknowledged"),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="handoffs",
    )

    nurse = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="handoffs",
    )

    incoming_nurse = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="incoming_handoffs",
    )

    input_text = models.TextField()
    sbar_summary = models.TextField(blank=True)

    risk_level = models.CharField(
        max_length=20,
        choices=RISK_CHOICES,
        default="Low",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Draft",
    )

    acknowledged_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient.name} - {self.nurse.username}"
