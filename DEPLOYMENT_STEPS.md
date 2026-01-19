# AutoMate Deployment Steps - Heroku + Vercel

## ✅ Completed Steps

### Backend (Heroku)
- [x] Heroku CLI installed
- [x] Heroku app created: `automate-backend-prod`
- [x] PostgreSQL addon added (essential-0)
- [x] Redis addon added (mini)
- [x] Environment variables configured:
  - SECRET_KEY
  - DEBUG=False
  - ALLOWED_HOSTS
  - CORS_ALLOWED_ORIGINS
  - CSRF_TRUSTED_ORIGINS
  - OPENAI_API_KEY
  - Email settings
- [x] Buildpacks configured for monorepo
- [x] GitHub connected to Heroku
- [x] Auto-deploys enabled

### Frontend
- [x] API URL updated to use environment variable
- [x] Changes committed to GitHub

---

## 🔄 Current Step: Deploy Backend

**Action Required:**
1. Go to: https://dashboard.heroku.com/apps/automate-backend-prod/deploy/github
2. Scroll to "Manual deploy" section
3. Select branch: `main`
4. Click **"Deploy Branch"**
5. Wait for build to complete (~3-5 minutes)

---

## 📋 Next Steps After Backend Deploys

### 1. Run Database Migrations
```bash
heroku run python manage.py migrate -a automate-backend-prod
```

### 2. Create Superuser (Optional)
```bash
heroku run python manage.py createsuperuser -a automate-backend-prod
```

### 3. Test Backend API
```bash
curl https://automate-backend-prod.herokuapp.com/api/cars/
```

### 4. Deploy Frontend to Vercel

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to: https://vercel.com/new
2. Import your GitHub repository: `0gu3han/AutoMate`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://automate-backend-prod.herokuapp.com/api`
5. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

### 5. Update CORS Settings

Once you have your Vercel URL (e.g., `https://automate-xyz.vercel.app`), update Heroku config:

```bash
heroku config:set \
  CORS_ALLOWED_ORIGINS='https://automate-backend-prod.herokuapp.com,https://your-vercel-url.vercel.app' \
  CSRF_TRUSTED_ORIGINS='https://automate-backend-prod.herokuapp.com,https://your-vercel-url.vercel.app' \
  -a automate-backend-prod
```

---

## 🎯 Verification Checklist

After deployment:
- [ ] Backend responds at: https://automate-backend-prod.herokuapp.com/api/
- [ ] Frontend loads at: https://your-vercel-url.vercel.app
- [ ] Can login from frontend
- [ ] Can create a car
- [ ] Can add maintenance record
- [ ] AI diagnostics work
- [ ] Email reminders configured (check Celery worker)

---

## 🚀 Optional: Start Celery Worker for Email Reminders

```bash
# This will start a background worker for scheduled tasks
heroku ps:scale worker=1 -a automate-backend-prod
```

**Note:** This requires adding a worker dyno to your Procfile. Update `/backend/Procfile`:
```
web: gunicorn automate.wsgi --log-file -
worker: celery -A automate worker -l info
beat: celery -A automate beat -l info
```

---

## 📊 Monitoring

- **Heroku Logs**: `heroku logs --tail -a automate-backend-prod`
- **Database**: `heroku pg:info -a automate-backend-prod`
- **Redis**: `heroku redis:info -a automate-backend-prod`
- **Vercel Logs**: https://vercel.com/dashboard → Your Project → Deployments

---

## 💰 Cost Estimate

### Heroku (Monthly)
- PostgreSQL (essential-0): ~$5/month
- Redis (mini): ~$3/month
- Web dyno (eco): Free tier available
- **Total**: ~$8/month

### Vercel
- Hobby plan: Free
- Pro plan (if needed): $20/month

---

## 🔐 Security Notes

- SECRET_KEY is set to a unique value
- DEBUG is False in production
- HTTPS enforced via Heroku
- CORS restricted to your domains
- Database credentials managed by Heroku
- API keys stored as environment variables

---

## 📝 Your App URLs

- **Backend API**: https://automate-backend-prod.herokuapp.com
- **Frontend**: (Will be assigned after Vercel deployment)
- **Admin Panel**: https://automate-backend-prod.herokuapp.com/admin/

---

Generated: January 19, 2026
