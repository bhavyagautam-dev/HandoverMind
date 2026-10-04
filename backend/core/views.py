from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .permissions import IsAdmin, IsNurse

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # User role
        if user.groups.filter(name="Admin").exists():
            role = "Admin"
        elif user.groups.filter(name="Nurse").exists():
            role = "Nurse"
        else:
            role = "User"

        token["role"] = role
        token["username"] = user.username

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        if self.user.groups.filter(name="Admin").exists():
            role = "Admin"
        elif self.user.groups.filter(name="Nurse").exists():
            role = "Nurse"
        else:
            role = "User"

        data["user"] = {
            "username": self.user.username,
            "role": role
        }

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class AdminTestView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            "message": "Admin API accessed successfully",
            "user": request.user.username
        })


class NurseTestView(APIView):
    permission_classes = [IsNurse]

    def get(self, request):
        return Response({
            "message": "Nurse API accessed successfully",
            "user": request.user.username
        })