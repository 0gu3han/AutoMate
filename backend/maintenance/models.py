from django.db import models
from django.contrib.auth.models import User
from cars.models import Car
from datetime import timedelta
from celery import current_app
from django.utils import timezone

class MaintenanceEvent(models.Model):
    MAINTENANCE_TYPES = [
        ("oil_change", "Oil Change"),
        ("brake_change", "Brake Change"),
        ("tire_rotation", "Tire Rotation"),
        ("other", "Other"),
    ]
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="maintenance_events")
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPES)
    date = models.DateField()
    mileage = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenance_events', null=True, blank=True)

    def __str__(self):
        return f"{self.get_maintenance_type_display()} for {self.car} at {self.mileage} miles on {self.date}"


class Reminder(models.Model):
    REMINDER_STATUS = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("completed", "Completed"),
    ]
    
    maintenance_event = models.OneToOneField(MaintenanceEvent, on_delete=models.CASCADE, related_name='reminder')
    reminder_date = models.DateField(help_text="Date when the reminder should be sent")
    status = models.CharField(max_length=20, choices=REMINDER_STATUS, default='pending')
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    
    class Meta:
        ordering = ['reminder_date']
    
    def __str__(self):
        return f"Reminder for {self.maintenance_event} on {self.reminder_date}"
    
    def schedule_email(self):
        """Schedule the email to be sent on the reminder date using Celery"""
        from maintenance.tasks import send_reminder_email
        
        # Calculate delay until reminder date at 9 AM
        reminder_datetime = timezone.make_aware(
            timezone.datetime.combine(self.reminder_date, timezone.datetime.min.time())
        ).replace(hour=9, minute=0, second=0)
        
        # Schedule the task
        send_reminder_email.apply_async(
            args=[self.id],
            eta=reminder_datetime
        ) 