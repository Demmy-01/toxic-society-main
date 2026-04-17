# Admin Portal Setup Guide

## 🔐 Admin Authentication System

Your admin portal now has a secure role-based authentication system with one-time admin registration.

## Setup Steps

### Step 1: Create the Admin Users Table in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your "toxic society" project
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Copy and paste the SQL below:

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can read admin users"
  ON admin_users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can update their own admin record"
  ON admin_users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
```

6. Click **"Run"**
7. You should see success message: "Ran 1 query successfully"

### Step 2: Access Admin Registration

1. Go to `yourdomain.com/admin`
2. You'll be redirected to `/admin/register` (since no admin exists yet)
3. Fill in:
   - **Email**: Your admin email
   - **Password**: At least 8 characters
   - **Confirm Password**: Must match
4. Click **"Create Admin Account"**

### Step 3: Login

1. You'll be redirected to `/admin/login`
2. Log in with your admin credentials
3. You now have access to the full admin dashboard!

## How It Works

### Registration
- **One-time setup**: Only shows registration if NO admin exists
- **After first admin**: Page locks down, shows "Admin already exists" message
- **Automatic creation**: Creates both Supabase Auth user and admin_users record

### Login
- Checks email + password against Supabase Auth
- Verifies user has admin privileges in `admin_users` table
- Denies access if user authenticated but not an admin
- Creates secure session

### Security Features
- ✅ Role-based access control (admin, editor, viewer)
- ✅ Row Level Security (RLS) enabled
- ✅ One-time registration prevents unauthorized signups
- ✅ Admin records tied to auth users
- ✅ Automatic cleanup if user deleted

## Managing Admins

### Add More Admins (After First One)

In Supabase SQL Editor:

```sql
-- Invite a new admin (they sign up first, then you add to admin_users)
INSERT INTO admin_users (id, email, role, is_owner)
SELECT id, email, 'editor', FALSE
FROM auth.users
WHERE email = 'newadmin@toxicsociety.com';
```

### Change Admin Roles

```sql
-- Change role to editor (limited permissions)
UPDATE admin_users 
SET role = 'editor' 
WHERE email = 'admin@toxicsociety.com';
```

### Remove Admin

```sql
-- Remove admin (keeps auth user, removes admin access)
DELETE FROM admin_users 
WHERE email = 'oldadmin@toxicsociety.com';
```

## Troubleshooting

### "No routes matched location '/admin'"
- **Cause**: Router basename issue
- **Fix**: Already fixed in vite.config.ts and App.tsx

### "Access denied. You do not have admin privileges"
- **Cause**: User is authenticated but not in admin_users table
- **Fix**: Add user to admin_users table in Supabase

### "Failed to create admin account"
- **Cause**: Database error
- **Fix**: Check that admin_users table was created correctly

### Admin registration page stuck on "checking admins"
- **Cause**: admin_users table doesn't exist or permission issue
- **Fix**: Run the SQL setup query in Step 1

## Environment Variables

Make sure your `.env.local` file has:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

1. ✅ Create the admin_users table (Step 1)
2. ✅ Register first admin (Step 2)
3. ✅ Login and test dashboard (Step 3)
4. 📝 Add more admins as needed
5. 🔐 Configure role permissions for editors/viewers
