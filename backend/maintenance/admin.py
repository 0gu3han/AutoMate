from django.contrib import admin
from .models import MaintenanceEvent

@admin.register(MaintenanceEvent)
class MaintenanceEventAdmin(admin.ModelAdmin):
    list_display = ("car", "maintenance_type", "date", "mileage")
    list_filter = ("maintenance_type", "date")
    search_fields = ("car__vin", "car__make", "car__model") 