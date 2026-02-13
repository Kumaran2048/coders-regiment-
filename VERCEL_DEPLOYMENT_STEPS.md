# Vercel Deployment Steps - Quick Guide

## 🚀 Step-by-Step Deployment

### 1. **Remove Example Variable**
- Delete the `EXAMPLE_NAME` variable (it's just an example)

### 2. **Add Required Environment Variables**

Click **"Add More"** and add these variables:

#### **Variable 1:**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://pcrvupcggrdhyorjzmnj.supabase.co`

#### **Variable 2:**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjcnZ1cGNnZ3JkaHlvcmp6bW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDE3ODcsImV4cCI6MjA4NjQ3Nzc4N30.voRSo1nwOK4RX0cEhu5PnY1Q2Hr2Lqz2N2qr09SUKW4`

### 3. **Optional: Stripe Variables** (if you have them)
- **Key**: `STRIPE_SECRET_KEY`
- **Value**: `sk_test_...` or `sk_live_...`

- **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_...` or `pk_live_...`

### 4. **Click "Deploy"**
- Wait 2-3 minutes for build to complete
- Vercel will show build logs

### 5. **After Deployment**

1. **Copy your deployment URL** (e.g., `https://coders-regiment.vercel.app`)

2. **Update Supabase Redirect URLs**:
   - Go to: https://supabase.com/dashboard/project/pcrvupcggrdhyorjzmnj/auth/url-configuration
   - Add to **Redirect URLs**:
     ```
     https://coders-regiment.vercel.app/**
     https://coders-regiment.vercel.app/auth/callback
     ```
   - Click **Save**

3. **Test your app**:
   - Visit your Vercel URL
   - Try signing up
   - Test creating a group
   - Test adding items to lists

### 6. **Share Your App**
- Share the Vercel URL with judges/colleagues
- Example: `https://coders-regiment.vercel.app`

---

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables added in Vercel
- [ ] Build settings correct (Next.js, root: ./)
- [ ] Ready to deploy!

---

## 🐛 If Build Fails

1. **Check build logs** in Vercel dashboard
2. **Common issues**:
   - Missing environment variables → Add them
   - Build errors → Check logs for specific errors
   - TypeScript errors → Fix before deploying

---

## 📝 Environment Variables Reference

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

**Optional:**
- `STRIPE_SECRET_KEY` - Stripe secret key (for payments)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

---

**Once deployed, your app will be live and shareable! 🎉**
