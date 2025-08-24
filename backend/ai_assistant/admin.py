from django.contrib import admin
from .models import DiagnosisRequest

@admin.register(DiagnosisRequest)
class DiagnosisRequestAdmin(admin.ModelAdmin):
    list_display = ("car", "created_at", "ai_result")
    search_fields = ("car__vin", "ai_result") 