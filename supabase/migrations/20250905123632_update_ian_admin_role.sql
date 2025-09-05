-- Location: supabase/migrations/20250905123632_update_ian_admin_role.sql
-- Schema Analysis: user_profiles table exists with role column (user_role enum includes admin)
-- Integration Type: Modification - Update existing user to admin role
-- Dependencies: existing user_profiles table, existing ian@ianmclayton.com user

-- Update ian@ianmclayton.com to have admin role in user_profiles
-- First, ensure the user_profiles record exists by creating one if needed
INSERT INTO public.user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Ian Clayton'),
    'admin'::public.user_role,
    true,
    now(),
    now()
FROM auth.users au
WHERE au.email = 'ian@ianmclayton.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin'::public.user_role,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    updated_at = now();

-- Verify the update
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count 
    FROM public.user_profiles 
    WHERE email = 'ian@ianmclayton.com' AND role = 'admin'::public.user_role;
    
    IF user_count > 0 THEN
        RAISE NOTICE 'Successfully updated ian@ianmclayton.com to admin role';
    ELSE
        RAISE NOTICE 'Warning: Could not find or update user ian@ianmclayton.com';
    END IF;
END $$;