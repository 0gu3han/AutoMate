from django.urls import path
from . import views

urlpatterns = [
    path('', views.DiagnosisRequestListCreateView.as_view(), name='diagnosis-list-create'),
    path('<int:pk>/', views.DiagnosisRequestDetailView.as_view(), name='diagnosis-detail'),
    path('car/<int:car_id>/', views.CarDiagnosisListView.as_view(), name='car-diagnosis-list'),
] 