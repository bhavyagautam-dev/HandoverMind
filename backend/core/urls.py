from django.urls import path
from .views import (
    PatientListCreateView,
    PatientDetailView,
    HandoffListCreateView,
)

urlpatterns = [
    path("patients/", PatientListCreateView.as_view(), name="patient-list-create"),
    path("patients/<int:patient_id>/",PatientDetailView.as_view(),name="patient-detail"),
    path("handoffs/",HandoffListCreateView.as_view(),name="handoff-list-create"),
]