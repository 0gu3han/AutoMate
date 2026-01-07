from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
import csv
from .models import MaintenanceEvent, Reminder
from .serializers import MaintenanceEventSerializer, ReminderSerializer
from cars.models import Car

class MaintenanceEventListCreateView(generics.ListCreateAPIView):
    serializer_class = MaintenanceEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['service_type', 'car', 'completed']
    search_fields = ['service_type', 'description', 'mechanic_notes']
    ordering_fields = ['date', 'cost', 'created_at']
    ordering = ['-date']

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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['service_type', 'completed']
    search_fields = ['service_type', 'description']
    ordering_fields = ['date', 'cost']
    ordering = ['-date']
    
    def get_queryset(self):
        car_id = self.kwargs['car_id']
        return MaintenanceEvent.objects.filter(car_id=car_id, user=self.request.user)


class ReminderListCreateView(generics.ListCreateAPIView):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        reminder = serializer.save(user=self.request.user)
        # Schedule the email to be sent on the reminder date
        reminder.schedule_email()


class ReminderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_reminders(request):
    """Send email reminders for maintenance events due today or overdue"""
    today = timezone.now().date()
    pending_reminders = Reminder.objects.filter(
        reminder_date__lte=today,
        status='pending'
    )
    
    sent_count = 0
    for reminder in pending_reminders:
        try:
            # Send email to user
            user_email = reminder.user.email
            subject = f"Maintenance Reminder: {reminder.maintenance_event.get_maintenance_type_display()}"
            message = f"""
Hello {reminder.user.first_name or reminder.user.username},

This is a reminder for your car maintenance:

Car: {reminder.maintenance_event.car}
Service Type: {reminder.maintenance_event.get_maintenance_type_display()}
Scheduled Date: {reminder.maintenance_event.date}
Notes: {reminder.maintenance_event.notes}

Please schedule your appointment soon.

Best regards,
AutoMate Team
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user_email],
                fail_silently=False,
            )
            
            # Mark reminder as sent
            reminder.status = 'sent'
            reminder.notification_sent_at = timezone.now()
            reminder.save()
            sent_count += 1
        except Exception as e:
            return Response(
                {'error': f'Failed to send reminder: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(
        {'message': f'Sent {sent_count} reminder(s)'},
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_maintenance_csv(request):
    """Export user's maintenance events to CSV file"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="maintenance_history.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Date', 'Car', 'Service Type', 'Description', 'Cost', 'Mileage', 'Mechanic Notes', 'Completed', 'Created At'])
    
    events = MaintenanceEvent.objects.filter(user=request.user).select_related('car').order_by('-date')
    for event in events:
        writer.writerow([
            event.date.strftime('%Y-%m-%d'),
            f"{event.car.make} {event.car.model} ({event.car.year})",
            event.service_type,
            event.description or '',
            event.cost or '',
            event.mileage or '',
            event.mechanic_notes or '',
            'Yes' if event.completed else 'No',
            event.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    return response
    
    return Response({
        'message': f'Successfully sent {sent_count} reminders',
        'count': sent_count
    }, status=status.HTTP_200_OK) 