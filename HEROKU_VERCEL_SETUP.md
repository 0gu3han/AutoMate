# AutoMate - Heroku + Vercel Deployment Guide

This guide walks you through deploying AutoMate backend on Heroku and frontend on Vercel.

## Prerequisites

1. **Heroku account** - https://heroku.com (free tier available)
2. **Vercel account** - https://vercel.com (free tier available)
3. **GitHub account** - Code will be pushed to GitHub for automatic deployment
4. **Heroku CLI** - https://devcenter.heroku.com/articles/heroku-cli
5. **Git** - Already installed on your system

---

## Part 1: Deploy Backend on Heroku

### 1.1 Install Heroku CLI

```bash
# macOS with Homebrew
brew tap heroku/brew && brew install heroku

# Verify installation
heroku --version
```

### 1.2 Push code to GitHub

```bash
cd /Users/oguzhan/Desktop/AutoMate

# Initialize git repo (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AutoMate app"

# Create repo on GitHub, then add remote
git remote add origin https://github.com/yourusername/AutoMate.git
git branch -M main
git push -u origin main
```

### 1.3 Create Heroku app

```bash
# Login to Heroku
heroku login

# Create app (replace with unique name)
heroku create automate-backend

# You'll get a URL like: https://automate-backend.herokuapp.com
```

### 1.4 Set environment variables on Heroku

```bash
# Generate a new SECRET_KEY
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copy the output and use it below

# Set config variables
heroku config:set SECRET_KEY="your-generated-secret-key"
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=automate-backend.herokuapp.com
heroku config:set OPENAI_API_KEY=sk-your-actual-openai-key
```

### 1.5 Deploy to Heroku

```bash
# Deploy from main branch
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser (optional, for admin panel)
heroku run python manage.py createsuperuser

# View logs
heroku logs --tail
```

### 1.6 Verify backend is running

```bash
# Test the backend
curl https://automate-backend.herokuapp.com/api/cars/
# You should get a response (may be empty list or error about auth, both are ok)
```

---

## Part 2: Deploy Frontend on Vercel

### 2.1 Connect GitHub to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Find your AutoMate repository and click "Import"

### 2.2 Configure build settings in Vercel

When prompted for configuration:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Root Directory**: `frontend`

### 2.3 Set environment variables in Vercel

In the Vercel dashboard:

1. Go to your project settings
2. Click "Environment Variables"
3. Add new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://automate-backend.herokuapp.com`
   - **Environment**: Production

### 2.4 Update frontend code to use the API base URL

The frontend is already configured to use `import.meta.env.VITE_API_BASE_URL`, so no code changes needed. The Vercel environment variable will override the local `.env.production` file.

### 2.5 Deploy

Click "Deploy" in Vercel. Your app will auto-deploy on every push to `main` branch.

### 2.6 Verify frontend is deployed

Visit the URL provided by Vercel (something like `https://automate-frontend-xxx.vercel.app`) and test:
- Can you see the Cars page?
- Can you click "Add Car"?
- Does the Make dropdown have options?

---

## Part 3: Connect Frontend & Backend

### 3.1 Update CORS settings on backend

Your backend needs to allow requests from your Vercel frontend.

```bash
# Get your Vercel frontend URL from Vercel dashboard
# Set CORS on Heroku
heroku config:set CORS_ALLOWED_ORIGINS="https://your-vercel-url.vercel.app,https://your-custom-domain.com"
```

Restart the backend:
```bash
heroku restart
```

### 3.2 Test the connection

In your browser:

1. Open your Vercel frontend URL
2. Go to Cars page
3. Try to add a car
4. Check browser DevTools (F12) → Network tab
5. Look for API requests to `https://automate-backend.herokuapp.com/api/cars/`

---

## Part 4: Post-Deployment Setup

### 4.1 Collect static files

```bash
# Heroku should do this automatically, but you can manually trigger:
heroku run python manage.py collectstatic --no-input
```

### 4.2 Monitor backend logs

```bash
# Continuously watch logs
heroku logs --tail

# View recent logs
heroku logs -n 100
```

### 4.3 Set up custom domain (optional)

**For Heroku:**
```bash
heroku domains:add api.your-domain.com
# Follow DNS setup instructions
```

**For Vercel:**
- Go to project settings
- Click "Domains"
- Add your domain

---

## Troubleshooting

### Frontend can't connect to backend

**Error**: `CORS error` or `Connection refused`

**Fix**:
1. Verify backend URL in Vercel environment variables
2. Check `CORS_ALLOWED_ORIGINS` on backend:
   ```bash
   heroku config:get CORS_ALLOWED_ORIGINS
   ```
3. Make sure frontend domain is listed:
   ```bash
   heroku config:set CORS_ALLOWED_ORIGINS="https://your-vercel-url.vercel.app"
   ```

### Backend deployment fails

**Error**: `remote rejected: failed to compile`

**Fix**:
1. Check logs:
   ```bash
   heroku logs --tail
   ```
2. Ensure `requirements.txt` is up to date:
   ```bash
   pip freeze > requirements.txt
   ```
3. Push to main, then retry:
   ```bash
   git push origin main
   ```

### Static files not loading

**Error**: 404 on `/static/...`

**Fix**:
```bash
# Collect static files
heroku run python manage.py collectstatic --no-input

# Restart
heroku restart
```

### OpenAI API not working

**Error**: `OPENAI_API_KEY not set`

**Fix**:
```bash
# Verify key is set
heroku config:get OPENAI_API_KEY

# If empty, set it again
heroku config:set OPENAI_API_KEY=sk-your-actual-key
```

---

## Next: Deploy Mobile App (Optional)

Once backend and frontend are live, you can deploy the React Native mobile app:

```bash
cd AutoMateMobile
npm install
npm start

# Or deploy to Expo:
eas build --platform ios --auto-submit
eas build --platform android --auto-submit
```

Make sure to update the API base URL in `AutoMateMobile/app.json`:
```json
{
  "extra": {
    "apiBaseUrl": "https://automate-backend.herokuapp.com"
  }
}
```

---

## Quick Reference Commands

### Heroku
```bash
heroku login                                    # Login to Heroku
heroku create automate-backend                  # Create app
heroku config:set KEY=value                     # Set env var
heroku logs --tail                              # Watch logs
heroku run python manage.py migrate             # Run migrations
heroku open                                     # Open app in browser
heroku destroy --confirm app-name               # Delete app
```

### Vercel
- Dashboard: https://vercel.com/dashboard
- Environment variables: Project → Settings → Environment Variables
- Domains: Project → Settings → Domains
- Redeploy: Push to `main` branch on GitHub

---

## Costs

**Heroku Free Tier:**
- ✅ Up to 550 dyno hours/month (1 dyno = 24/7 for ~23 days)
- ✅ Free PostgreSQL database (10k rows)
- ⚠️ Apps go to sleep after 30 min inactivity (startup delay when accessed)

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ Automatic SSL/HTTPS
- ✅ Built-in analytics

To avoid Heroku app sleeping, upgrade to Paid ($7/month) or use Railway/Render instead.

---

## Support

- **Heroku Docs**: https://devcenter.heroku.com
- **Vercel Docs**: https://vercel.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/5.2/howto/deployment/
- **OpenAI API**: https://platform.openai.com

Good luck! 🚀
