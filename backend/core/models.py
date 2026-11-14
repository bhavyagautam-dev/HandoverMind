
import uuid
import hashlib

from django.db import models
from django.db.models import Q
from django.contrib.auth.models import User
from django.utils import timezone


class Hospital(models.Model):

    name = models.CharField(max_length=200)

    city = models.CharField(
        max_length=100,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "city"],
                name="unique_hospital_name_city",
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.city}"


class UserProfile(models.Model):

    ROLE_CHOICES = [
        ("Manager", "Manager"),
        ("Nurse", "Nurse"),
        ("Non-medical Staff", "Non-medical Staff"),
    ]

    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name="members",
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES,
        default="Nurse",
    )

    email_verified = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["hospital"],
                condition=Q(role="Manager"),
                name="one_manager_per_hospital",
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.hospital.name} ({self.role})"
        )


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

    patient_id = models.CharField(
        max_length=20,
        editable=False,
    )

    name = models.CharField(max_length=100)

    age = models.PositiveIntegerField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
    )

    room_number = models.CharField(max_length=20)

    diagnosis = models.TextField(blank=True)

    allergies = models.TextField(blank=True)

    admission_date = models.DateField(
        default=timezone.localdate,
        editable=False,
    )

    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name="patients",
        null=True,
        blank=True,
    )

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

    discharge_date = models.DateField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["hospital", "patient_id"],
                name="unique_patient_id_per_hospital",
            )
        ]

    def save(self, *args, **kwargs):

        if not self.patient_id:
            self.patient_id = (
                f"PT-{uuid.uuid4().hex[:8].upper()}"
            )

        if not self.admission_date:
            self.admission_date = timezone.localdate()

        super().save(*args, **kwargs)

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

    acknowledged_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.patient.name} - "
            f"{self.nurse.username}"
        )


class EmailOTP(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="email_otp",
    )

    otp_hash = models.CharField(max_length=64)

    expires_at = models.DateTimeField()

    attempts = models.PositiveIntegerField(default=0)

    last_sent_at = models.DateTimeField(auto_now_add=True)

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def set_otp(self, otp):
        self.otp_hash = hashlib.sha256(
            otp.encode()
        ).hexdigest()

    def verify_otp(self, otp):
        otp_hash = hashlib.sha256(
            otp.encode()
        ).hexdigest()

        return self.otp_hash == otp_hash

    def __str__(self):
        return f"Email OTP - {self.user.username}"
