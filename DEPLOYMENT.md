# 🚀 Deployment Guide

## Option 1: Render (Recommended)

### Step 1: Prepare Repository
1. Make sure all changes are pushed to GitHub
2. Your repository is ready at: `https://github.com/satriyobud/360-app`

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository: `satriyobud/360-app`
5. Configure:
   - **Name**: `360-feedback-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### Step 3: Environment Variables
Add these in Render dashboard:
- `NODE_ENV` = `production`
- `PORT` = `10000` (Render will set this automatically)

### Step 4: Deploy
Click "Create Web Service" and wait for deployment!

---

## Option 2: Vercel + Railway Split

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Deploy

### Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Set **Root Directory** to `backend`
4. Deploy

---

## Option 3: Fly.io (Free Alternative)

### Step 1: Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Deploy
```bash
cd /path/to/your/app
fly launch
fly deploy
```

---

## What Works Best

**Render** is the easiest option because:
- ✅ One-click deployment
- ✅ Supports SQLite
- ✅ Free tier (750 hours/month)
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ No credit card required

Your app will be live at: `https://your-app-name.onrender.com`
