from django.urls import path
from . import views

urlpatterns = [
    path('', views.MaintenanceEventListCreateView.as_view(), name='maintenance-list-create'),
    path('export/', views.export_maintenance_csv, name='export-maintenance-csv'),
    path('<int:pk>/', views.MaintenanceEventDetailView.as_view(), name='maintenance-detail'),
    path('car/<int:car_id>/', views.CarMaintenanceListView.as_view(), name='car-maintenance-list'),
    path('reminders/', views.ReminderListCreateView.as_view(), name='reminder-list-create'),
    path('reminders/<int:pk>/', views.ReminderDetailView.as_view(), name='reminder-detail'),
    path('send-reminders/', views.send_reminders, name='send-reminders'),
] 