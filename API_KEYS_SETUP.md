# API Keys Security & Setup Guide

## 🔒 Security Overview

This project uses environment variables to manage sensitive API keys. Keys are **never committed to the repository** thanks to `.gitignore` protection.

### Key Classification

| Key | Usage | Scope | Exposure |
|-----|-------|-------|----------|
| `VITE_PAYSTACK_PUBLIC_KEY` | Payment popup initialization | Client-side | ✅ Safe (public) |
| `PAYSTACK_SECRET_KEY` | Payment verification | Server-only | ❌ Must keep private |
| `VITE_SUPABASE_URL` | Database connection | Client-side | ✅ Safe (URL only) |
| `VITE_SUPABASE_ANON_KEY` | DB auth (with RLS) | Client-side | ✅ Safe (RLS protected) |

---

## 📋 Local Development Setup

1. **Create `.env.local`** (not committed, in .gitignore):
   ```bash
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_[your-paystack-public-key]
   PAYSTACK_SECRET_KEY=sk_live_[your-paystack-secret-key]
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Run locally**:
   ```bash
   npm run dev
   ```

3. **Test payments**: Use live Paystack keys with test card (Paystack provides test card numbers)

---

## 🚀 Production Setup (Vercel)

### 1. Set Vercel Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these variables:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_PAYSTACK_PUBLIC_KEY` | `pk_live_[your-public-key]` | Production |
| `PAYSTACK_SECRET_KEY` | `sk_live_[your-secret-key]` | Production |
| `VITE_SUPABASE_URL` | Your Supabase URL | Production |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Production |

**Save and redeploy** for changes to take effect.

---

## 🛡️ Supabase Edge Functions Setup

### 1. Set Supabase Secrets

Go to **Supabase Dashboard** → **Project Settings** → **Secrets**

Add these secrets:

```bash
PAYSTACK_SECRET_KEY=sk_live_[your-secret-key]
```

### 2. Link Secrets to Functions

In `supabase/functions/paystack-verify/index.ts`:
```typescript
const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
```

### 3. Deploy

```bash
supabase functions deploy paystack-verify
```

Verify it's using the live key:
```bash
supabase functions describe paystack-verify
```

---

## ⚠️ Critical Security Rules

### ❌ NEVER DO THIS:
- ❌ Commit `.env.local` or any `.env` files
- ❌ Hardcode API keys in source code
- ❌ Use secret keys in client-side code (React, frontend)
- ❌ Log or expose `PAYSTACK_SECRET_KEY`
- ❌ Share API keys in Slack, email, or documentation

### ✅ ALWAYS DO THIS:
- ✅ Use environment variables for all secrets
- ✅ Keep `.env` in `.gitignore`
- ✅ Store production secrets in Vercel & Supabase dashboards
- ✅ Rotate keys regularly (after developer onboarding/offboarding)
- ✅ Use different keys for development vs. production
- ✅ Enable Paystack IP whitelisting in dashboard

---

## 🔄 Key Rotation (If Compromised)

### 1. Generate New Live Keys
- Go to Paystack Dashboard → Settings → Developers
- Generate new keys

### 2. Update Everywhere
- ✅ Update Vercel environment variables
- ✅ Update Supabase secrets
- ✅ Update local `.env.local`
- ✅ Update GitHub Actions secrets (if using CI/CD)

### 3. Invalidate Old Keys
- ✅ Disable old API keys in Paystack dashboard

### 4. Redeploy
```bash
# Vercel will auto-redeploy with new env vars
# For Supabase:
supabase functions deploy paystack-verify
```

---

## 🧪 Testing Payment Verification

### Local Testing
```bash
npm run dev
# Use test payment cards provided by Paystack
```

### Production Testing (with live key)
- Use actual test cards or small amounts
- Monitor Paystack dashboard for transactions
- Check `/api/verify-payment` logs in Vercel

---

## 📍 Files Using These Keys

| File | Purpose | Key Used |
|------|---------|----------|
| `src/app/components/CheckoutModal.tsx` | Payment popup | `VITE_PAYSTACK_PUBLIC_KEY` |
| `api/verify-payment.ts` | Payment verification (Vercel) | `PAYSTACK_SECRET_KEY` |
| `supabase/functions/paystack-verify/index.ts` | Payment verification (Supabase) | `PAYSTACK_SECRET_KEY` |
| `supabase/functions/send-campaign/index.ts` | Email campaigns | `RESEND_API_KEY` (optional) |

---

## 🔍 Audit Checklist

- [ ] No API keys in git history (`git log -p --all | grep sk_`)
- [ ] Vercel env variables set for production
- [ ] Supabase secrets configured
- [ ] Local `.env.local` created and in `.gitignore`
- [ ] `.env.example` documents all required variables
- [ ] Payment verification working in production
- [ ] No console.log statements with sensitive data
- [ ] IP whitelisting enabled in Paystack (recommended)
