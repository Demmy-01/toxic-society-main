# Admin Portal Setup Guide

## 🔐 Admin Authentication System

Your admin portal now has a **secure**, **rate-limit-free** authentication system using a Supabase Edge Function.

## Setup Steps (EASY!)

### Step 1: Create the Admin Users Table

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your "toxic society" project
3. Go to **SQL Editor**
4. Click **"New Query"**
5. Paste this:

```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin count"
  ON admin_users FOR SELECT USING (true);

CREATE POLICY "Admins can read admin users"
  ON admin_users FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admin_users WHERE role IN ('admin', 'editor')));

CREATE POLICY "Users can update their own admin record"
  ON admin_users FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
```

6. Click **"Run"** ✅

### Step 2: Deploy the Edge Function

This happens **automatically**:

- The edge function code is already in your repo (`supabase/functions/create-admin-user/`)
- When you deploy to Vercel, it auto-syncs to Supabase
- OR run locally:

```bash
supabase functions deploy create-admin-user
```

### Step 3: Register Admin

1. Go to `yourdomain.com/admin`
2. You'll see the registration form
3. Fill in email and password
4. Click **"Create Admin Account"**

✅ Done! No more rate limiting!

### What This Does

- ✅ Edge function uses Supabase **admin API** (no rate limits)
- ✅ Auto-confirms email (no email verification needed)
- ✅ One-time setup (prevents multiple admins)
- ✅ Secure (admin is tied to auth user)

## How It Works

### Registration Flow

1. Submit email + password
2. Edge function creates auth user (using admin API - bypasses rate limits!)
3. Edge function creates admin_users record
4. Auto-login and redirect to dashboard

### Login Flow

1. Enter email + password
2. System checks Supabase Auth
3. Verifies user exists in admin_users table
4. If not admin → denies access

## Security

- ✅ Role-based access control (admin, editor, viewer)
- ✅ Row Level Security (RLS) enabled
- ✅ One-time registration only
- ✅ Admin records tied to auth users
- ✅ Service role key only used server-side

## Managing Admins

### Add More Admins

In Supabase SQL Editor:

```sql
-- Create auth user first, then add to admin_users
INSERT INTO admin_users (id, email, role, is_owner)
SELECT id, email, 'editor', FALSE
FROM auth.users
WHERE email = 'newadmin@toxicsociety.com';
```

### Change Roles

```sql
UPDATE admin_users SET role = 'editor' WHERE email = 'admin@toxicsociety.com';
```

### Remove Admin

```sql
DELETE FROM admin_users WHERE email = 'admin@toxicsociety.com';
```

## Troubleshooting

### Email Rate Limit Exceeded

- **Cause**: Old signup attempts (now FIXED by edge function)
- **Fix**: This shouldn't happen anymore!

### "Access denied. You do not have admin privileges"

- **Cause**: User authenticated but not in admin_users
- **Fix**: Manually add to admin_users in Supabase

### Edge Function Not Working

- **Fix**: Run `supabase functions deploy create-admin-user` locally

## Environment Variables

Your `.env.local` needs:

```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

Your Vercel project needs the secret:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```
