from django.urls import path
from . import views

urlpatterns = [
    path('', views.CarListCreateView.as_view(), name='car-list-create'),
    path('<int:pk>/', views.CarDetailView.as_view(), name='car-detail'),
] 