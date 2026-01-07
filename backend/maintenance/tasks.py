from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Reminder


@shared_task
def send_reminder_email(reminder_id):
    """
    Send a single reminder email for a specific maintenance event.
    This task is scheduled individually when a reminder is created.
    """
    try:
        reminder = Reminder.objects.get(id=reminder_id)
        user_email = reminder.user.email
        
        if not user_email:
            reminder.status = 'completed'
            reminder.save()
            return {'status': 'skipped', 'reason': 'No email address'}

        subject = f"Maintenance Reminder: {reminder.maintenance_event.get_maintenance_type_display()}"
        message = f"""
Hello {reminder.user.first_name or reminder.user.username},

This is a reminder for your car maintenance:

Car: {reminder.maintenance_event.car}
Service Type: {reminder.maintenance_event.get_maintenance_type_display()}
Scheduled Date: {reminder.maintenance_event.date}
Notes: {reminder.maintenance_event.notes or 'No additional notes'}

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
        
        reminder.status = 'sent'
        reminder.notification_sent_at = timezone.now()
        reminder.save()
        
        return {'status': 'sent', 'reminder_id': reminder_id}

    except Reminder.DoesNotExist:
        return {'status': 'failed', 'reason': 'Reminder not found'}
    except Exception as e:
        return {'status': 'failed', 'reason': str(e)}


@shared_task
def send_pending_reminders():
    """
    Send email reminders for maintenance events scheduled for today or overdue.
    This task is scheduled to run daily via Celery Beat.
    """
    today = timezone.now().date()
    pending_reminders = Reminder.objects.filter(
        reminder_date__lte=today,
        status='pending'
    )
    
    sent_count = 0
    failed_count = 0

    for reminder in pending_reminders:
        try:
            user_email = reminder.user.email
            if not user_email:
                reminder.status = 'completed'
                reminder.save()
                continue

            subject = f"Maintenance Reminder: {reminder.maintenance_event.get_maintenance_type_display()}"
            message = f"""
Hello {reminder.user.first_name or reminder.user.username},

This is a reminder for your car maintenance:

Car: {reminder.maintenance_event.car}
Service Type: {reminder.maintenance_event.get_maintenance_type_display()}
Scheduled Date: {reminder.maintenance_event.date}
Notes: {reminder.maintenance_event.notes or 'No additional notes'}

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
            
            reminder.status = 'sent'
            reminder.notification_sent_at = timezone.now()
            reminder.save()
            sent_count += 1

        except Exception as e:
            failed_count += 1
            print(f'Failed to send reminder {reminder.id}: {str(e)}')

    return {
        'sent': sent_count,
        'failed': failed_count,
    }
