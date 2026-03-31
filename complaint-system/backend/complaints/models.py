"""
Models for the complaints app.
Defines the Complaint model with all required fields.
"""

from django.db import models
from django.contrib.auth.models import User


class Complaint(models.Model):
    """
    Complaint model representing a citizen complaint.

    Fields:
        user        - The user who submitted the complaint (ForeignKey to User)
        title       - Short title/summary of the complaint
        description - Detailed description of the issue
        image       - Optional photo of the issue (uploaded to media/complaint_images/)
        location    - Location/address where the issue was found
        status      - Current status: Pending, In Progress, or Resolved
        created_at  - Timestamp when complaint was submitted (auto-set)
    """

    # Status choices for the complaint
    class Status(models.TextChoices):
        PENDING     = 'Pending',     'Pending'
        IN_PROGRESS = 'In Progress', 'In Progress'
        RESOLVED    = 'Resolved',    'Resolved'

    # Link to the user who submitted the complaint
    # on_delete=CASCADE means if the user is deleted, their complaints are also deleted
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='complaints'
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    # Optional image upload; stored under media/complaint_images/
    image = models.ImageField(
        upload_to='complaint_images/',
        blank=True,
        null=True
    )

    location = models.CharField(max_length=300)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING  # New complaints start as Pending
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Most recent complaints first

    def __str__(self):
        return f"{self.title} - {self.status} (by {self.user.username})"
