from rest_framework import serializers
from .models import DiagnosisRequest
from cars.serializers import CarSerializer

class DiagnosisRequestSerializer(serializers.ModelSerializer):
    car = CarSerializer(read_only=True)
    car_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = DiagnosisRequest
        fields = ['id', 'car', 'car_id', 'image', 'ai_result', 'damage_description', 'created_at'] 