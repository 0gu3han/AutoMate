from django.db import models
from django.contrib.auth.models import User
from cars.models import Car

class DiagnosisRequest(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name="diagnosis_requests")
    image = models.ImageField(upload_to="diagnosis_images/")
    ai_result = models.TextField(blank=True)
    damage_description = models.TextField(blank=True, help_text="User's description of damage")
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='diagnosis_requests', null=True, blank=True)

    def __str__(self):
        return f"Diagnosis for {self.car} at {self.created_at}" 