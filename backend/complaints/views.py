"""
Views (API endpoints) for the complaints app.
All views use class-based views from Django REST Framework.
"""

from django.contrib.auth.models import User
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Complaint
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ComplaintSerializer,
    ComplaintCreateSerializer,
    ComplaintStatusUpdateSerializer,
)


# ==============================================================================
# CUSTOM PERMISSION CLASSES
# ==============================================================================

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission: Only allow admin (staff) users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


# ==============================================================================
# AUTH VIEWS
# ==============================================================================

class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user. No authentication required.

    Request body: { username, email, password, password2 }
    Response: { user info + JWT tokens }
    """

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can register

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the newly registered user
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'User registered successfully!',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Login with username and password. Returns JWT tokens.
    No authentication required (public endpoint).

    Request body: { username, password }
    Response: { user info + JWT tokens }
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Validate that both fields are provided
        if not username or not password:
            return Response(
                {'error': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Look up the user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check the password
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if the user account is active
        if not user.is_active:
            return Response(
                {'error': 'This account is disabled.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Login successful!',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklist the refresh token (logout user).

    Request body: { refresh }
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()  # Invalidate this token
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================================
# COMPLAINT VIEWS
# ==============================================================================

class ComplaintListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/complaints/       - List complaints
    POST /api/complaints/       - Create a new complaint (with optional image)

    For regular users: GET returns only their own complaints.
    For admin users: GET returns ALL complaints.

    Authentication required for all operations.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        """Use different serializers for reading vs writing."""
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def get_queryset(self):
        """
        Filter complaints based on user role:
        - Admin users see ALL complaints
        - Regular users see only their own complaints
        """
        user = self.request.user
        if user.is_staff:
            return Complaint.objects.all()  # Admin sees everything
        return Complaint.objects.filter(user=user)  # User sees only their own

    def get_serializer_context(self):
        """Pass request context to serializer (needed for absolute image URLs)."""
        return {'request': self.request}


class ComplaintDetailView(generics.RetrieveAPIView):
    """
    GET /api/complaints/<id>/   - Get details of a specific complaint.

    Regular users can only view their own complaints.
    Admin users can view any complaint.
    """

    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Complaint.objects.all()
        return Complaint.objects.filter(user=user)

    def get_serializer_context(self):
        return {'request': self.request}


class ComplaintStatusUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/complaints/<id>/status/   - Update complaint status (Admin only)

    Only admin/staff users can change the status of a complaint.
    Request body: { status: "Pending" | "In Progress" | "Resolved" }
    """

    queryset = Complaint.objects.all()
    serializer_class = ComplaintStatusUpdateSerializer
    permission_classes = [IsAdminUser]  # Only admins can update status
    http_method_names = ['patch']  # Only allow PATCH requests


class UserProfileView(APIView):
    """
    GET /api/auth/profile/   - Get current logged-in user's profile.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
