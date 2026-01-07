# AutoMate Deployment Checklist

## 🔴 CRITICAL (Must Fix Before Deployment)

### 1. **Database Migration to PostgreSQL**
```bash
# Install postgres adapter
pip install psycopg2-binary

# Update settings.py DATABASES for production:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}
```

### 2. **Environment Variables (.env.production)**
Required variables:
- `SECRET_KEY` - Strong random key
- `DEBUG=False`
- `ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com`
- `DATABASE_URL` - PostgreSQL connection
- `OPENAI_API_KEY` - Your API key
- `EMAIL_HOST_USER` - Gmail address
- `EMAIL_HOST_PASSWORD` - App password
- `CELERY_BROKER_URL` - Redis connection
- `CSRF_TRUSTED_ORIGINS=https://yourdomain.com`

### 3. **CORS Configuration**
Update in settings.py:
```python
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')
```

### 4. **Static & Media Files**
```python
# Add to production settings.py
if not DEBUG:
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATIC_URL = '/static/'
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # Use S3 for media files (install boto3, django-storages)
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION', 'us-east-1')
```

### 5. **Security Headers**
```python
# Add to settings.py
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_SECURITY_POLICY = {
    'default-src': ("'self'",),
    'script-src': ("'self'", "'unsafe-inline'"),
    'style-src': ("'self'", "'unsafe-inline'"),
}
```

### 6. **Celery/Redis Setup**
- Deploy Redis instance (AWS ElastiCache, Heroku Redis add-on)
- Start Celery worker: `celery -A automate worker -l info`
- Start Celery beat: `celery -A automate beat -l info`

## 🟡 HIGH PRIORITY (Strongly Recommended)

### 7. **Add User Profile Page**
- Profile view/edit endpoint
- Settings page for email preferences
- Avatar upload

### 8. **Search & Filter**
- Car search by model/year/make
- Maintenance filter by type/date range
- Diagnosis search by date

### 9. **Logging & Monitoring**
```python
# Add to settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/error.log'),
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'ERROR',
    },
}
```

### 10. **Error Tracking (Sentry)**
```python
# pip install sentry-sdk
import sentry_sdk
sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    traces_sample_rate=0.1,
)
```

### 11. **API Rate Limiting**
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

### 12. **Image Optimization**
```python
# In ai_assistant/views.py - compress images before saving
from PIL import Image
import io

def compress_image(image_file, max_size=(1200, 1200)):
    img = Image.open(image_file)
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=80)
    output.seek(0)
    return output
```

## 🟢 NICE TO HAVE (Future Improvements)

- [ ] Export maintenance records to PDF/CSV
- [ ] In-app push notifications
- [ ] Mobile app (React Native/Flutter)
- [ ] Maintenance cost tracking/analytics
- [ ] Integration with vehicle APIs (VIN decoding)
- [ ] Appointment booking for service centers
- [ ] Social sharing of car profiles
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Offline mode support

## 📋 Deployment Steps

### Heroku Backend:
1. Create PostgreSQL database
2. Set environment variables in Heroku dashboard
3. Deploy: `git push heroku main`
4. Run migrations: `heroku run python manage.py migrate`
5. Create superuser: `heroku run python manage.py createsuperuser`

### Vercel Frontend:
1. Update API endpoint in `frontend/src/services/api.js`
2. Deploy: `vercel --prod`
3. Configure environment variables in Vercel dashboard

### Redis/Celery (Heroku):
1. Add Redis add-on: `heroku addons:create heroku-redis:premium-0`
2. Add Procfile worker: `worker: celery -A automate worker -l info`

## ✅ Final Pre-Launch

- [ ] Test all APIs in production environment
- [ ] Verify email reminders are working
- [ ] Check AI diagnostics with real images
- [ ] Load test with 100+ concurrent users
- [ ] Security audit (run `python manage.py check --deploy`)
- [ ] Backup database strategy
- [ ] Monitoring & alerting setup
- [ ] Terms of Service & Privacy Policy pages
