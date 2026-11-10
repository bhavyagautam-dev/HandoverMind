
from django.urls import path

from .views import (
    PatientListCreateView,
    PatientDetailView,
    HandoffListCreateView,
    HandoffDetailView,
    NurseManagementView,
    StaffManagementView,
    GenerateSBARView,
    IncomingHandoffInboxView,
    AcknowledgeHandoffView,
    HospitalRegistrationView,
)

urlpatterns = [
    #registretion
    path(
    "auth/hospital-register/",
    HospitalRegistrationView.as_view(),
    name="hospital-register",
    ),
    # Patients
    path(
        "patients/",
        PatientListCreateView.as_view(),
        name="patient-list",
    ),
    path(
        "patients/<int:patient_id>/",
        PatientDetailView.as_view(),
        name="patient-detail",
    ),

    # Handoffs
    path(
        "handoffs/",
        HandoffListCreateView.as_view(),
        name="handoff-list",
    ),
    path(
        "handoffs/<int:handoff_id>/",
        HandoffDetailView.as_view(),
        name="handoff-detail",
    ),
    path(
        "handoffs/inbox/",
        IncomingHandoffInboxView.as_view(),
        name="incoming-handoff-inbox",
    ),
    path(
        "handoffs/<int:handoff_id>/acknowledge/",
        AcknowledgeHandoffView.as_view(),
        name="acknowledge-handoff",
    ),
    path(
        "handoffs/generate-sbar/",
        GenerateSBARView.as_view(),
        name="generate-sbar",
    ),

    # Nurse management
    path(
        "nurses/",
        NurseManagementView.as_view(),
        name="nurse-management",
    ),
    path(
        "nurses/<int:nurse_id>/",
        NurseManagementView.as_view(),
        name="nurse-detail",
    ),

    # Staff management
    path(
        "staff/",
        StaffManagementView.as_view(),
        name="staff-management",
    ),
    path(
        "staff/<int:staff_id>/",
        StaffManagementView.as_view(),
        name="staff-detail",
    ),
]
