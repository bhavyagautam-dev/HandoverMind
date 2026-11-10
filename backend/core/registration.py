from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction

from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import Hospital, UserProfile

User = get_user_model()


class RegisterThrottle(AnonRateThrottle):
    rate = "10/hour"


class ManagerRegisterSerializer(serializers.Serializer):
    hospital_name = serializers.CharField(max_length=200)
    hospital_city = serializers.CharField(
        max_length=100, required=False, allow_blank=True
    )
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(
        max_length=150, required=False, allow_blank=True
    )
    last_name = serializers.CharField(
        max_length=150, required=False, allow_blank=True
    )
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_hospital_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Hospital name is required.")
        return value

    def validate_username(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate(self, attrs):
        city = attrs.get("hospital_city", "").strip()
        attrs["hospital_city"] = city

        if Hospital.objects.filter(
            name__iexact=attrs["hospital_name"],
            city__iexact=city,
        ).exists():
            raise serializers.ValidationError(
                {
                    "hospital_name": [
                        "This hospital is already registered. "
                        "Ask your hospital's Manager for an account."
                    ]
                }
            )

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": ["Passwords do not match."]}
            )

        temp_user = User(
            username=attrs["username"],
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
            email=attrs.get("email", ""),
        )

        try:
            validate_password(attrs["password"], user=temp_user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        return attrs


class ManagerRegisterView(APIView):
    """Registers a new hospital together with its Manager."""

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [RegisterThrottle]

    def post(self, request):
        serializer = ManagerRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        with transaction.atomic():
            hospital = Hospital.objects.create(
                name=data["hospital_name"],
                city=data["hospital_city"],
            )

            user = User.objects.create_user(
                username=data["username"],
                password=data["password"],
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                email=data.get("email", ""),
            )

            group, _ = Group.objects.get_or_create(name="Manager")
            user.groups.add(group)

            UserProfile.objects.create(user=user, hospital=hospital)

        return Response(
            {
                "message": "Hospital and Manager account created successfully.",
                "hospital": hospital.name,
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )