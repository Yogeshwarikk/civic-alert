"""
Admin panel configuration for the complaints app.
Registers models with the Django admin site for easy management.
"""

from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    """
    Complaint admin configuration.
    Customize how complaints appear in the Django admin panel.
    """

    # Columns shown in the list view
    list_display = ['id', 'title', 'user', 'location', 'status', 'created_at']

    # Filters shown in the right sidebar
    list_filter = ['status', 'created_at']

    # Fields that can be searched
    search_fields = ['title', 'description', 'location', 'user__username']

    # Fields that can be edited directly from the list view
    list_editable = ['status']

    # Default ordering
    ordering = ['-created_at']

    # Make created_at read-only in detail view
    readonly_fields = ['created_at']
