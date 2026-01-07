import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'automate.settings')

app = Celery('automate')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat Schedule for periodic tasks
app.conf.beat_schedule = {
    'send-maintenance-reminders': {
        'task': 'maintenance.tasks.send_pending_reminders',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
