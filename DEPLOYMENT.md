# Deployment Guide - FreshCart

This guide will help you deploy FreshCart to production.

## 🚀 Quick Deploy to Vercel (Easiest)

### Step 1: Prepare Your Code

1. Make sure all your code is committed:
```bash
git add .
git commit -m "Ready for deployment"
```

2. Push to GitHub:
```bash
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STRIPE_SECRET_KEY=sk_live_... (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (if using payments)
```

### Step 4: Deploy

Click **"Deploy"** and wait for build to complete!

Your app will be live at: `https://your-project.vercel.app`

---

## 🌐 Other Deployment Options

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import from GitHub
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables in Site settings
6. Deploy!

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Add environment variables
5. Railway auto-detects Next.js and deploys

### Deploy to Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Settings:
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy!

---

## 🔧 Pre-Deployment Checklist

- [ ] All SQL scripts run in Supabase
- [ ] Environment variables configured
- [ ] Test locally: `npm run build` succeeds
- [ ] Test authentication flow
- [ ] Test creating groups and lists
- [ ] Test real-time features
- [ ] Update Supabase redirect URLs (if needed)

### Update Supabase Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/auth/callback`

---

## 📦 Build for Production

Test the production build locally:

```bash
npm run build
npm start
```

Visit `http://localhost:3000` to test.

---

## 🔐 Environment Variables Reference

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### Optional
- `STRIPE_SECRET_KEY` - Stripe secret key (for payments)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Auth redirect URL

---

## 🐛 Common Deployment Issues

### Build Fails

**Error**: Module not found
- **Solution**: Run `npm install --legacy-peer-deps` locally first

**Error**: Type errors
- **Solution**: Fix TypeScript errors before deploying

### Database Connection Issues

**Error**: Can't connect to Supabase
- **Solution**: Check environment variables are set correctly
- Verify Supabase project is active

### Authentication Not Working

**Error**: Redirect errors
- **Solution**: Add production URL to Supabase redirect URLs
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct

---

## 📊 Post-Deployment

1. **Test all features**:
   - Sign up / Login
   - Create groups
   - Add items to lists
   - Send messages
   - Create expenses

2. **Monitor**:
   - Check Vercel/Netlify logs
   - Monitor Supabase dashboard
   - Check error tracking (if set up)

3. **Share**:
   - Share your deployed URL
   - Update README with live link
   - Share with judges/users!

---

## 🔗 Quick Links

- **Vercel**: https://vercel.com
- **Netlify**: https://netlify.com
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Supabase Dashboard**: https://supabase.com/dashboard

---

**Good luck with your deployment! 🚀**
