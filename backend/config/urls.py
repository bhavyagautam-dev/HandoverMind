from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import CustomTokenObtainPairView
from core.views import (
    AdminTestView,
    NurseTestView,
)
from django.urls import path, include
from core.views import PatientListCreateView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/test/admin/", AdminTestView.as_view(), name="admin-test"),
    path("api/test/nurse/", NurseTestView.as_view(), name="nurse-test"),

    path("api/", include("core.urls")),
]