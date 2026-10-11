from django.urls import path
from .views import (
    PatientListCreateView,
    PatientDetailView,
    HandoffListCreateView,
    HandoffDetailView,
    NurseManagementView,
    StaffManagementView,
)

urlpatterns = [
    path("patients/", PatientListCreateView.as_view(), name="patient-list"),
    path("patients/<int:patient_id>/", PatientDetailView.as_view(), name="patient-detail"),
    path("handoffs/", HandoffListCreateView.as_view(), name="handoff-list"),
    path("handoffs/<int:handoff_id>/", HandoffDetailView.as_view(), name="handoff-detail"),
    path("nurses/",NurseManagementView.as_view(),name="nurse-management",),
    path("staff/",StaffManagementView.as_view(),name="staff-management",),
    path("nurses/<int:nurse_id>/",NurseManagementView.as_view(),name="nurse-detail",),
    path("staff/<int:staff_id>/",StaffManagementView.as_view(),name="staff-detail",),

]