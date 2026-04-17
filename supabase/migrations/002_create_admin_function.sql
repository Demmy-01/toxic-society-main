-- Create a function to handle admin creation
-- This function runs with elevated privileges (postgres role)
CREATE OR REPLACE FUNCTION public.create_admin_user(user_id UUID, user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_admin_count INT;
  result JSONB;
BEGIN
  -- Check if any admin already exists
  SELECT COUNT(*) INTO existing_admin_count FROM admin_users;
  
  IF existing_admin_count > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admin account already exists');
  END IF;
  
  -- Insert the admin user
  INSERT INTO admin_users (id, email, role, is_owner)
  VALUES (user_id, user_email, 'admin', true)
  ON CONFLICT DO NOTHING;
  
  -- Return success
  RETURN jsonb_build_object('success', true, 'message', 'Admin user created successfully');
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_admin_user(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_user(UUID, TEXT) TO anon;
