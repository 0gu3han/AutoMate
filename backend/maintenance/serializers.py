from rest_framework import serializers
from .models import MaintenanceEvent
from cars.serializers import CarSerializer

class MaintenanceEventSerializer(serializers.ModelSerializer):
    car = CarSerializer(read_only=True)
    car_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MaintenanceEvent
        fields = ['id', 'car', 'car_id', 'maintenance_type', 'date', 'mileage', 'notes'] 