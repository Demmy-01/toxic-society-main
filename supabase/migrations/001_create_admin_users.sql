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
-- Allow anyone to check if admins exist (for registration page)
CREATE POLICY "Anyone can read admin count"
  ON admin_users
  FOR SELECT
  USING (true);

-- Allow admins to read all admin users
CREATE POLICY "Admins can read admin users"
  ON admin_users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('admin', 'editor')
    )
  );

-- Allow only the owner to update
CREATE POLICY "Users can update their own admin record"
  ON admin_users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function handles inserts with proper permissions - no policy needed

-- Create indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
