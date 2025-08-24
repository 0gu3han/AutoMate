from django.urls import path
from . import views

urlpatterns = [
    path('', views.MaintenanceEventListCreateView.as_view(), name='maintenance-list-create'),
    path('<int:pk>/', views.MaintenanceEventDetailView.as_view(), name='maintenance-detail'),
    path('car/<int:car_id>/', views.CarMaintenanceListView.as_view(), name='car-maintenance-list'),
] 