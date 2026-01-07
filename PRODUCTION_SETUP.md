# Production Environment Setup for AutoMate

## Backend Production Configuration

### 1. PostgreSQL Setup
```bash
# Local PostgreSQL (macOS)
brew install postgresql
brew services start postgresql
createdb automate_prod

# Or use cloud database:
# Heroku: postgres://user:pass@host:port/dbname
# AWS RDS: postgresql://user:pass@rds-endpoint.amazonaws.com/dbname
```

### 2. Redis Setup (for Celery)
```bash
# Local Redis (macOS)
brew install redis
brew services start redis

# Or use cloud Redis:
# Heroku: redis://user:pass@host:port
# AWS ElastiCache: redis://endpoint.cache.amazonaws.com:6379
```

### 3. Create .env.production
```env
# Django
SECRET_KEY=your-very-secret-key-here-generate-with-secrets-module
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/automate_prod

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# Email
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Celery & Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# CORS & Security
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# AWS S3 (optional, for media files)
AWS_BUCKET_NAME=automate-prod-bucket
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx

# Sentry (error tracking)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 4. Install Production Dependencies
```bash
pip install -r requirements.txt
pip install gunicorn
pip install psycopg2-binary
pip install django-storages boto3  # For S3
pip install sentry-sdk  # Error tracking
```

### 5. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

### 6. Run Migrations
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 7. Security Check
```bash
python manage.py check --deploy
```

## Frontend Production Configuration

### 1. Update API Endpoint
Edit `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-domain.com/api';
```

### 2. Build for Production
```bash
cd frontend
npm run build
```

### 3. Environment Variables (.env.production)
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

## Deployment Strategies

### Option 1: Heroku (Simple, Cost: ~$50/month)
```bash
# Backend
heroku login
heroku create automate-backend
heroku addons:create heroku-postgresql:standard-0
heroku addons:create heroku-redis:premium-0
heroku config:set SECRET_KEY=xxx DEBUG=False
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser

# Frontend
cd frontend
npm install -g vercel
vercel --prod
```

### Option 2: AWS (More complex, Cost: ~$20-100/month)
- EC2 for Django backend (t3.micro free tier)
- RDS for PostgreSQL (db.t3.micro free tier)
- ElastiCache for Redis
- S3 for media files
- CloudFront for static files
- Route53 for DNS

### Option 3: DigitalOcean (Balanced, Cost: ~$30/month)
- 1 App Platform droplet (Django + Gunicorn)
- Managed PostgreSQL
- Spaces for object storage
- App Platform for frontend

### Option 4: Google Cloud Run (Serverless, Cost: ~$10-30/month)
- Container-based deployment
- Cloud SQL for database
- Memorystore for Redis

## Production Checklist

### Before Launch:
- [ ] Database backup strategy implemented
- [ ] CDN configured for static files
- [ ] Email service verified (test reminder sends)
- [ ] API rate limiting enabled
- [ ] Error monitoring (Sentry) configured
- [ ] Logging to file/cloud enabled
- [ ] SSL/TLS certificate valid
- [ ] CORS/CSRF properly configured
- [ ] Image compression working
- [ ] Load testing (simulate 1000+ users)

### After Launch:
- [ ] Monitor error rates (< 0.1%)
- [ ] Check API response times (< 500ms)
- [ ] Review user feedback daily
- [ ] Monitor database connections
- [ ] Check email delivery rate
- [ ] Track feature usage with analytics
- [ ] Plan weekly backups
- [ ] Set up on-call alerting

## Monitoring & Maintenance

### Daily Checks:
```bash
# Check logs
heroku logs --tail

# Check database status
heroku pg:info

# Check Redis status
heroku redis:info
```

### Weekly Backup:
```bash
# Backup database
pg_dump automate_prod > backup_$(date +%Y%m%d).sql

# Backup media files
aws s3 sync s3://automate-prod-bucket ./backups/media/
```

### Monthly Maintenance:
- Update dependencies
- Review error logs
- Optimize slow queries
- Clean up old records
- Test disaster recovery

## Rollback Plan

If deployment fails:
```bash
# Revert to previous version
git revert HEAD
git push heroku main

# Or manually restart with previous build
heroku releases
heroku rollback v123
```
