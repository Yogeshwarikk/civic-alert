"""
Serializers for the complaints app.
Handles conversion between Python objects and JSON for the API.
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Complaint


# ==============================================================================
# AUTH SERIALIZERS
# ==============================================================================

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Accepts: username, email, password, password2 (confirmation)
    """

    # Extra field for password confirmation (not stored in DB)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True},  # Password never returned in response
        }

    def validate(self, data):
        """Check that the two passwords match."""
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        """Create a new user with hashed password."""
        # Remove password2 before creating user
        validated_data.pop('password2')
        # create_user() automatically hashes the password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Simple serializer to represent user info in responses.
    Used inside ComplaintSerializer to show who submitted a complaint.
    """

    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# ==============================================================================
# COMPLAINT SERIALIZERS
# ==============================================================================

class ComplaintSerializer(serializers.ModelSerializer):
    """
    Full serializer for Complaint model.
    Used for reading complaints (GET requests).
    Includes nested user info.
    """

    # Nested user object (read-only) instead of just a user ID
    user = UserSerializer(read_only=True)

    # Make image URL absolute (includes the domain prefix)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id', 'user', 'title', 'description',
            'image', 'location', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at']

    def get_image(self, obj):
        """Return full absolute URL for image if it exists."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new complaint (POST request).
    Handles image uploads.
    """

    class Meta:
        model = Complaint
        fields = ['id', 'title', 'description', 'image', 'location', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def create(self, validated_data):
        """Automatically assign the logged-in user as the complaint owner."""
        # Get the current logged-in user from the request context
        user = self.context['request'].user
        complaint = Complaint.objects.create(user=user, **validated_data)
        return complaint


class ComplaintStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for admin to update complaint status only.
    Only allows the 'status' field to be updated.
    """

    class Meta:
        model = Complaint
        fields = ['id', 'status']
