from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import HttpResponse
import csv
from .models import Car
from .serializers import CarSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

class CarListCreateView(generics.ListCreateAPIView):
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['make', 'model', 'year', 'vin', 'owner']
    search_fields = ['make', 'model', 'vin', 'owner']
    ordering_fields = ['year', 'make']

    def get_queryset(self):
        return Car.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CarDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Car.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_cars_csv(request):
    """Export user's cars to CSV file"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="my_cars.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Make', 'Model', 'Year', 'VIN', 'Owner'])
    
    cars = Car.objects.filter(user=request.user).order_by('-year', 'make')
    for car in cars:
        writer.writerow([
            car.make,
            car.model,
            car.year,
            car.vin or '',
            car.owner,
        ])
    
    return response 