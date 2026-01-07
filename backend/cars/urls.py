from django.urls import path
from . import views

urlpatterns = [
    path('', views.CarListCreateView.as_view(), name='car-list-create'),
    path('export/', views.export_cars_csv, name='export-cars-csv'),
    path('<int:pk>/', views.CarDetailView.as_view(), name='car-detail'),
] 