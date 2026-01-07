from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from maintenance.models import Reminder


class Command(BaseCommand):
    help = 'Send email reminders for maintenance events due today or overdue'

    def handle(self, *args, **options):
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
                    self.stdout.write(
                        self.style.WARNING(
                            f'Skipping reminder {reminder.id}: User has no email'
                        )
                    )
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

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Sent reminder {reminder.id} to {user_email}'
                    )
                )
            except Exception as e:
                failed_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f'Failed to send reminder {reminder.id}: {str(e)}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully sent {sent_count} reminders, {failed_count} failed'
            )
        )
