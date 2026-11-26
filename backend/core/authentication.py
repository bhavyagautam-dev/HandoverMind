
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import UserProfile


class HospitalApprovalJWTAuthentication(JWTAuthentication):

    def get_user(self, validated_token):
        user = super().get_user(validated_token)

        # Super Admin can always access the system.
        if user.is_superuser:
            return user

        try:
            hospital = user.profile.hospital
        except UserProfile.DoesNotExist:
            # Users without a hospital profile are unaffected.
            return user

        if hospital.is_archived:
            raise AuthenticationFailed(
                "This hospital account has been archived."
            )

        if hospital.status == "PENDING":
            raise AuthenticationFailed(
                "Your hospital registration is awaiting Super Admin approval."
            )

        if hospital.status == "REJECTED":
            reason = hospital.rejection_reason

            message = "Your hospital registration has been rejected."

            if reason:
                message += f" Reason: {reason}"

            raise AuthenticationFailed(message)

        if hospital.status == "SUSPENDED":
            raise AuthenticationFailed(
                "Your hospital account has been suspended. Please contact support."
            )

        return user
