# AutoMate Deployment Guide

This guide covers deploying the complete AutoMate application (backend, web frontend, and mobile app).

---

## Table of Contents

1. [Backend Deployment (Django)](#backend-deployment-django)
2. [Frontend Deployment (React/Vite)](#frontend-deployment-reactvite)
3. [Mobile App Deployment (React Native/Expo)](#mobile-app-deployment-react-nativeexpo)
4. [Environment Variables & Security](#environment-variables--security)
5. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Backend Deployment (Django)

### Option 1: Heroku (Recommended for quick setup)

**Prerequisites:**
- Heroku account (free tier available)
- Heroku CLI installed

**Steps:**

1. **Create a Heroku app:**
   ```bash
   heroku login
   heroku create automate-backend
   ```

2. **Add Procfile to backend root:**
   ```bash
   cd backend
   echo "web: gunicorn automate.wsgi --log-file -" > Procfile
   ```

3. **Create requirements.txt:**
   ```bash
   pip freeze > requirements.txt
   ```

4. **Update Django settings for production:**
   Edit `backend/automate/settings.py`:
   ```python
   DEBUG = os.getenv('DEBUG', 'False') == 'True'
   ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
   SECURE_SSL_REDIRECT = not DEBUG
   SESSION_COOKIE_SECURE = not DEBUG
   CSRF_COOKIE_SECURE = not DEBUG
   ```

5. **Set environment variables on Heroku:**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DEBUG=False
   heroku config:set ALLOWED_HOSTS=automate-backend.herokuapp.com
   heroku config:set OPENAI_API_KEY=sk-your-api-key
   heroku config:set DATABASE_URL=postgresql://...  # If using PostgreSQL
   ```

6. **Install production database (optional but recommended):**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

7. **Deploy:**
   ```bash
   git push heroku main
   heroku run python manage.py migrate
   heroku run python manage.py createsuperuser
   ```

8. **View logs:**
   ```bash
   heroku logs --tail
   ```

### Option 2: Railway (Modern alternative)

**Steps:**

1. **Connect your GitHub repo to Railway:** https://railway.app
2. **Create a new project**
3. **Add environment variables in Railway dashboard**
4. **Deploy automatically** (Railway deploys on each push to main)

### Option 3: AWS EC2 / DigitalOcean / Linode

**Basic setup:**

1. **Provision a Linux server** (Ubuntu 22.04 recommended)

2. **Install dependencies:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx -y
   ```

3. **Clone your repo and setup:**
   ```bash
   cd /home/ubuntu
   git clone https://github.com/yourusername/AutoMate.git
   cd AutoMate/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt gunicorn psycopg2-binary
   ```

4. **Configure Gunicorn:**
   Create `/etc/systemd/system/automate.service`:
   ```ini
   [Unit]
   Description=AutoMate Backend
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/AutoMate/backend
   ExecStart=/home/ubuntu/AutoMate/backend/venv/bin/gunicorn automate.wsgi --bind 127.0.0.1:8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start automate
   sudo systemctl enable automate
   ```

5. **Configure Nginx:**
   Create `/etc/nginx/sites-available/automate`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /static/ {
           alias /home/ubuntu/AutoMate/backend/static/;
       }

       location /media/ {
           alias /home/ubuntu/AutoMate/backend/media/;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/automate /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl restart nginx
   ```

6. **Enable SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

---

## Frontend Deployment (React/Vite)

### Option 1: Vercel (Recommended for speed)

**Steps:**

1. **Connect GitHub to Vercel:** https://vercel.com/import/git
2. **Select your AutoMate repository**
3. **Configure build settings:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `frontend`
4. **Set environment variables in Vercel dashboard:**
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   ```
5. **Deploy** (automatic on push to main)

### Option 2: Netlify

**Steps:**

1. **Connect GitHub to Netlify:** https://netlify.com
2. **Select your repo**
3. **Build settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. **Add environment variables:**
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com
   ```
5. **Deploy**

### Option 3: AWS S3 + CloudFront

1. **Build the app:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://automate-frontend
   ```

3. **Upload files:**
   ```bash
   aws s3 sync dist/ s3://automate-frontend --delete
   ```

4. **Create CloudFront distribution** pointing to the S3 bucket

### Update API Base URL

Create `frontend/.env.production`:
```
VITE_API_BASE_URL=https://your-backend-domain.com
```

Update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

---

## Mobile App Deployment (React Native/Expo)

### Option 1: Expo (Easiest for development/testing)

**Preview on your device:**

1. **Install Expo Go** on your iOS/Android device
2. **Start development:**
   ```bash
   cd AutoMateMobile
   npm start
   ```
3. **Scan QR code** with Expo Go app

### Option 2: Expo Application Services (EAS) Build

**Build and release to app stores:**

1. **Create Expo account:**
   ```bash
   npx expo register
   ```

2. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

3. **Configure EAS:**
   ```bash
   cd AutoMateMobile
   eas build:configure
   ```

4. **Update eas.json** for your API:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "API_BASE_URL": "https://your-backend-domain.com"
         }
       }
     }
   }
   ```

5. **Build for iOS:**
   ```bash
   eas build --platform ios --auto-submit
   ```

6. **Build for Android:**
   ```bash
   eas build --platform android --auto-submit
   ```

7. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

### Option 3: Manual APK/IPA Build

**Android (APK):**
```bash
cd AutoMateMobile
eas build --platform android --local
# or
expo build:android -t apk
```

**iOS (IPA):**
```bash
eas build --platform ios --local
# or
expo build:ios
```

---

## Environment Variables & Security

### Backend (.env)
```
SECRET_KEY=your-django-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
OPENAI_API_KEY=sk-your-openai-key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-app.com
```

### Frontend (.env.production)
```
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Mobile (AutoMateMobile/app.json)
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://your-backend-domain.com"
    }
  }
}
```

### Security Best Practices
- ✅ Never commit `.env` files to git
- ✅ Use platform-specific secret management (Heroku config vars, Vercel env vars, etc.)
- ✅ Rotate API keys regularly
- ✅ Use HTTPS/SSL everywhere
- ✅ Set `SECURE_SSL_REDIRECT=True` in Django production
- ✅ Use strong, unique `SECRET_KEY`
- ✅ Enable CORS only for your domains
- ✅ Set up rate limiting on your API

---

## Post-Deployment Checklist

### Backend
- [ ] Debug set to `False`
- [ ] ALLOWED_HOSTS configured correctly
- [ ] Static files served (collectstatic run)
- [ ] Database migrated (`migrate` command run)
- [ ] Superuser created
- [ ] CORS_ALLOWED_ORIGINS set to frontend domains
- [ ] Environment variables set on hosting platform
- [ ] OpenAI API key configured
- [ ] HTTPS/SSL enabled
- [ ] Backup strategy in place

### Frontend
- [ ] API base URL points to deployed backend
- [ ] Environment variables set
- [ ] Build test locally (`npm run build`)
- [ ] Deployed successfully
- [ ] Test all features (login, add car, upload image, etc.)
- [ ] Performance optimized (check DevTools)
- [ ] Mobile responsive checked

### Mobile
- [ ] API base URL points to deployed backend
- [ ] App builds without errors
- [ ] Test on device
- [ ] TestFlight/internal testing configured
- [ ] Privacy policy added
- [ ] App store listing created
- [ ] Screenshots prepared

### Testing
- [ ] User registration works
- [ ] Login/authentication works
- [ ] Add/edit/delete cars works
- [ ] Dropdown makes/models working
- [ ] Image upload works
- [ ] OpenAI Vision API integration working
- [ ] Cross-origin requests working
- [ ] Rate limiting not blocking legitimate traffic

---

## Monitoring & Logging

### Django (Backend)
- Use **Sentry** for error tracking: https://sentry.io
- Check Heroku/platform logs regularly
- Set up email alerts for critical errors

### Frontend
- Use **LogRocket** or **Sentry** for frontend errors
- Monitor performance with **Vercel Analytics** (if deployed on Vercel)

### Mobile
- Use **Sentry** for crash reporting
- Monitor with **Firebase Crashlytics** (if using Firebase)

---

## Support & Troubleshooting

**Backend won't connect to OpenAI:**
- Verify `OPENAI_API_KEY` is set on platform
- Check billing at https://platform.openai.com/account/billing

**Frontend can't reach backend:**
- Check CORS settings in Django
- Verify `VITE_API_BASE_URL` is correct
- Check backend is running/accessible

**Mobile app authentication issues:**
- Verify token storage is working
- Check API endpoint in `app.json`
- Clear app cache and reinstall

---

## Next Steps

1. **Deploy backend first** (Heroku/Railway/AWS)
2. **Deploy frontend** (Vercel/Netlify)
3. **Test integration** (can frontend reach backend?)
4. **Deploy mobile app** (Expo EAS or manual build)
5. **Run post-deployment tests** (use checklist above)
6. **Monitor and iterate**

Good luck deploying! 🚀
