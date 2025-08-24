from django.db import models
from django.contrib.auth.models import User
from cars.models import Car

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