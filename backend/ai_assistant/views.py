from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import DiagnosisRequest
from .serializers import DiagnosisRequestSerializer
from .free_vision_service import FreeVisionService
from cars.models import Car
import threading

class DiagnosisRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = DiagnosisRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DiagnosisRequest.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        diagnosis = serializer.save(user=request.user)
        
        # Process AI analysis immediately for faster response
        try:
            vision_service = FreeVisionService()
            ai_result = vision_service.get_image_analysis(diagnosis.image, diagnosis.damage_description)
            
            # Update the diagnosis with AI result
            diagnosis.ai_result = ai_result
            diagnosis.save()
            
            # Return updated data with AI result
            return Response({
                **serializer.data,
                'ai_result': ai_result
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            error_message = f"AI analysis failed: {str(e)}. Please try again."
            diagnosis.ai_result = error_message
            diagnosis.save()
            
            return Response({
                **serializer.data,
                'ai_result': error_message
            }, status=status.HTTP_201_CREATED)

    def process_ai_diagnosis(self, diagnosis):
        """Process AI analysis using free Google Vision AI"""
        try:
            # Try free Google Vision first
            vision_service = FreeVisionService()
            ai_result = vision_service.get_image_analysis(diagnosis.image)
            
            # Update the diagnosis with AI result
            diagnosis.ai_result = ai_result
            diagnosis.save()
            
        except Exception as e:
            error_message = f"AI analysis failed: {str(e)}. Please try again."
            diagnosis.ai_result = error_message
            diagnosis.save()



class DiagnosisRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DiagnosisRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DiagnosisRequest.objects.filter(user=self.request.user)

class CarDiagnosisListView(generics.ListAPIView):
    serializer_class = DiagnosisRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        car_id = self.kwargs['car_id']
        return DiagnosisRequest.objects.filter(car_id=car_id, user=self.request.user) 