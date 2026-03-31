"""
URL patterns for the complaints app.
All routes are prefixed with /api/ (configured in main urls.py).
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    ComplaintListCreateView,
    ComplaintDetailView,
    ComplaintStatusUpdateView,
)

urlpatterns = [

    # ------------------------------------------------------------------
    # AUTH ENDPOINTS
    # ------------------------------------------------------------------
    # POST /api/auth/register/  - Create a new user account
    path('auth/register/', RegisterView.as_view(), name='register'),

    # POST /api/auth/login/     - Login and get JWT tokens
    path('auth/login/', LoginView.as_view(), name='login'),

    # POST /api/auth/logout/    - Logout (blacklist refresh token)
    path('auth/logout/', LogoutView.as_view(), name='logout'),

    # POST /api/auth/token/refresh/ - Refresh expired access token using refresh token
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # GET  /api/auth/profile/   - Get logged-in user's profile
    path('auth/profile/', UserProfileView.as_view(), name='profile'),

    # ------------------------------------------------------------------
    # COMPLAINT ENDPOINTS
    # ------------------------------------------------------------------
    # GET  /api/complaints/     - List complaints (user's own or all if admin)
    # POST /api/complaints/     - Create new complaint (with image upload)
    path('complaints/', ComplaintListCreateView.as_view(), name='complaint-list-create'),

    # GET  /api/complaints/<id>/  - Get specific complaint details
    path('complaints/<int:pk>/', ComplaintDetailView.as_view(), name='complaint-detail'),

    # PATCH /api/complaints/<id>/status/ - Update complaint status (admin only)
    path('complaints/<int:pk>/status/', ComplaintStatusUpdateView.as_view(), name='complaint-status-update'),
]
