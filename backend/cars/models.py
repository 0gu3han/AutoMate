from django.db import models
from django.contrib.auth.models import User

class Car(models.Model):
    vin = models.CharField(max_length=17, blank=True, null=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    owner = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cars', null=True, blank=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model}" 