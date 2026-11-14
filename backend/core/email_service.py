
import secrets
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import EmailOTP


def generate_and_send_otp(user):
    if not user.email:
        raise ValueError("User email address is required.")

    now = timezone.now()

    with transaction.atomic():
        otp_record, created = EmailOTP.objects.select_for_update().get_or_create(
            user=user,
            defaults={
                "otp_hash": "",
                "expires_at": now,
            },
        )

        # Prevent frequent OTP requests
        if not created:
            elapsed = (now - otp_record.last_sent_at).total_seconds()

            if elapsed < 60:
                raise ValueError(
                    "Please wait before requesting another OTP."
                )

        otp = f"{secrets.randbelow(1000000):06d}"

        otp_record.set_otp(otp)
        otp_record.expires_at = now + timedelta(minutes=5)
        otp_record.attempts = 0
        otp_record.is_verified = False
        otp_record.last_sent_at = now
        otp_record.save()

        try:
            send_mail(
                subject="HandoverMind - Email Verification",
                message=(
                    f"Hello {user.first_name or user.username},\n\n"
                    f"Your verification OTP is: {otp}\n\n"
                    "This OTP is valid for 5 minutes.\n"
                    "Please do not share it with anyone.\n\n"
                    "Regards,\nHandoverMind Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception:
            otp_record.delete()
            raise

    return True
