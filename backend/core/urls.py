
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
    SendEmailOTPView,
    VerifyEmailOTPView,
    ResendEmailOTPView,
    SuperAdminDashboardView,
    SuperAdminHospitalListView,
    SuperAdminHospitalStatusView,
    SuperAdminHospitalArchiveView,
)

urlpatterns = [
    # Hospital registration
    path("auth/send-otp/", SendEmailOTPView.as_view(), name="send-email-otp"),
    path("auth/verify-otp/", VerifyEmailOTPView.as_view(), name="verify-email-otp"),
    path("auth/resend-otp/", ResendEmailOTPView.as_view(), name="resend-email-otp"),
    path("auth/hospital-register/", HospitalRegistrationView.as_view(), name="hospital-register"),

    # Super Admin
    path(
        "super-admin/dashboard/",
        SuperAdminDashboardView.as_view(),
        name="super-admin-dashboard",
    ),
    path(
        "super-admin/hospitals/",
        SuperAdminHospitalListView.as_view(),
        name="super-admin-hospital-list",
    ),
    path(
        "super-admin/hospitals/<int:hospital_id>/status/",
        SuperAdminHospitalStatusView.as_view(),
        name="super-admin-hospital-status",
    ),
    path(
        "super-admin/hospitals/<int:hospital_id>/archive/",
        SuperAdminHospitalArchiveView.as_view(),
        name="super-admin-hospital-archive",
    ),

    # Patients
    path("patients/", PatientListCreateView.as_view(), name="patient-list"),
    path("patients/<int:patient_id>/", PatientDetailView.as_view(), name="patient-detail"),

    # Handoffs
    path("handoffs/", HandoffListCreateView.as_view(), name="handoff-list"),
    path("handoffs/<int:handoff_id>/", HandoffDetailView.as_view(), name="handoff-detail"),
    path("handoffs/inbox/", IncomingHandoffInboxView.as_view(), name="incoming-handoff-inbox"),
    path("handoffs/<int:handoff_id>/acknowledge/", AcknowledgeHandoffView.as_view(), name="acknowledge-handoff"),
    path("handoffs/generate-sbar/", GenerateSBARView.as_view(), name="generate-sbar"),

    # Nurse management
    path("nurses/", NurseManagementView.as_view(), name="nurse-management"),
    path("nurses/<int:nurse_id>/", NurseManagementView.as_view(), name="nurse-detail"),

    # Staff management
    path("staff/", StaffManagementView.as_view(), name="staff-management"),
    path("staff/<int:staff_id>/", StaffManagementView.as_view(), name="staff-detail"),
]
