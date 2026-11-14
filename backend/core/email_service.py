
import secrets
import hashlib
import hmac

from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import EmailVerification


def generate_and_send_email_otp(email, first_name=""):

    if not email:
        raise ValueError("Email address is required.")

    email = email.strip().lower()
    now = timezone.now()

    otp = f"{secrets.randbelow(1000000):06d}"

    with transaction.atomic():

        otp_record, created = (
            EmailVerification.objects.select_for_update().get_or_create(
                email=email,
                defaults={
                    "otp_hash": "",
                    "expires_at": now,
                    "attempts": 0,
                    "is_verified": False,
                },
            )
        )

        if not created:

            if otp_record.is_verified:
                raise ValueError(
                    "This email is already verified."
                )

            elapsed = (
                now - otp_record.last_sent_at
            ).total_seconds()

            if elapsed < 60:
                raise ValueError(
                    "Please wait 60 seconds before requesting another OTP."
                )

        try:

            send_mail(
                subject="HandoverMind - Email Verification",
                message=(
                    f"Hello {first_name or 'User'},\n\n"
                    f"Your HandoverMind verification OTP is: {otp}\n\n"
                    "This OTP is valid for 5 minutes.\n"
                    "You have a maximum of 5 verification attempts.\n\n"
                    "Please do not share this OTP with anyone.\n\n"
                    "Regards,\n"
                    "HandoverMind Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

        except Exception:
            if created:
                otp_record.delete()
            raise

        otp_record.set_otp(otp)

        otp_record.expires_at = (
            now + timedelta(minutes=5)
        )

        otp_record.attempts = 0
        otp_record.is_verified = False
        otp_record.verification_token_hash = ""
        otp_record.last_sent_at = now

        otp_record.save()

    return True


def verify_email_otp(email, otp):

    if not email or not otp:
        raise ValueError("Email and OTP are required.")

    email = email.strip().lower()
    otp = otp.strip()

    if len(otp) != 6 or not otp.isdigit():
        raise ValueError("Enter a valid 6-digit OTP.")

    verification_token = None
    error_message = None

    with transaction.atomic():

        try:

            otp_record = (
                EmailVerification.objects.select_for_update().get(
                    email=email
                )
            )

        except EmailVerification.DoesNotExist:
            raise ValueError(
                "OTP not found. Please request a new OTP."
            )

        if otp_record.is_verified:
            error_message = "This email is already verified."

        elif timezone.now() >= otp_record.expires_at:
            error_message = (
                "OTP has expired. Please request a new OTP."
            )

        elif otp_record.attempts >= 5:
            error_message = (
                "Maximum OTP attempts exceeded. Please request a new OTP."
            )

        elif not otp_record.verify_otp(otp):

            otp_record.attempts += 1

            otp_record.save(
                update_fields=["attempts"]
            )

            remaining = 5 - otp_record.attempts

            error_message = (
                f"Incorrect OTP. {remaining} attempts remaining."
            )

        else:

            verification_token = secrets.token_urlsafe(32)

            token_hash = hashlib.sha256(
                verification_token.encode()
            ).hexdigest()

            otp_record.is_verified = True

            otp_record.verification_token_hash = token_hash

            otp_record.expires_at = (
                timezone.now() + timedelta(minutes=15)
            )

            otp_record.save(
                update_fields=[
                    "is_verified",
                    "verification_token_hash",
                    "expires_at",
                ]
            )

    # Raise errors only after the transaction commits.
    # This ensures incorrect OTP attempts remain saved.
    if error_message:
        raise ValueError(error_message)

    return verification_token


def validate_email_verification_token(email, verification_token):

    if not email or not verification_token:
        return False

    email = email.strip().lower()

    token_hash = hashlib.sha256(
        verification_token.encode()
    ).hexdigest()

    try:

        otp_record = EmailVerification.objects.get(
            email=email,
            is_verified=True,
        )

    except EmailVerification.DoesNotExist:
        return False

    if timezone.now() >= otp_record.expires_at:
        return False

    return hmac.compare_digest(
        otp_record.verification_token_hash,
        token_hash,
    )


def consume_email_verification(email):

    if not email:
        return

    EmailVerification.objects.filter(
        email=email.strip().lower(),
        is_verified=True,
    ).delete()
