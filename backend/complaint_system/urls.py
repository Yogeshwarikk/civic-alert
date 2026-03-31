"""
Main URL configuration for complaint_system project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django Admin panel
    path('admin/', admin.site.urls),

    # All API routes are prefixed with /api/
    path('api/', include('complaints.urls')),
]

# Serve media files (uploaded images) in development
# In production, configure your web server (Nginx/Render) to serve these
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
