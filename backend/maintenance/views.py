from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from .models import MaintenanceEvent
from .serializers import MaintenanceEventSerializer
from cars.models import Car

class MaintenanceEventListCreateView(generics.ListCreateAPIView):
    serializer_class = MaintenanceEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MaintenanceEvent.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MaintenanceEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MaintenanceEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MaintenanceEvent.objects.filter(user=self.request.user)

class CarMaintenanceListView(generics.ListAPIView):
    serializer_class = MaintenanceEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        car_id = self.kwargs['car_id']
        return MaintenanceEvent.objects.filter(car_id=car_id, user=self.request.user) 