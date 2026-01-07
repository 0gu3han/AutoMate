from rest_framework import serializers
from .models import MaintenanceEvent, Reminder
from cars.serializers import CarSerializer

class MaintenanceEventSerializer(serializers.ModelSerializer):
    car = CarSerializer(read_only=True)
    car_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MaintenanceEvent
        fields = ['id', 'car', 'car_id', 'maintenance_type', 'date', 'mileage', 'notes']


class ReminderSerializer(serializers.ModelSerializer):
    maintenance_event = MaintenanceEventSerializer(read_only=True)
    maintenance_event_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Reminder
        fields = ['id', 'maintenance_event', 'maintenance_event_id', 'reminder_date', 'status', 'notification_sent_at', 'created_at']
        read_only_fields = ['notification_sent_at', 'created_at'] 