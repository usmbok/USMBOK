-- Location: supabase/migrations/20250905160435_ensure_ian_admin_access.sql
-- Schema Analysis: user_profiles table exists with role column (user_role enum: admin, premium, member)
-- Integration Type: Modification - Ensuring specific users have admin access
-- Dependencies: user_profiles table (existing)

-- Ensure ian@ianmclayton.com has admin level access
-- This will either insert a new profile or update existing one to admin role
DO $$
DECLARE
    ian_user_id UUID;
BEGIN
    -- Check if ian@ianmclayton.com exists in auth.users
    SELECT id INTO ian_user_id 
    FROM auth.users 
    WHERE email = 'ian@ianmclayton.com'
    LIMIT 1;
    
    IF ian_user_id IS NOT NULL THEN
        -- User exists in auth, ensure profile exists with admin role
        INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
        VALUES (
            ian_user_id, 
            'ian@ianmclayton.com', 
            'Ian McLayton', 
            'admin'::public.user_role, 
            true
        )
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin'::public.user_role,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP;
            
        RAISE NOTICE 'Updated ian@ianmclayton.com to admin role';
    ELSE
        -- User does not exist in auth.users, create placeholder profile
        -- This will be linked when the user actually registers
        INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
        VALUES (
            gen_random_uuid(), 
            'ian@ianmclayton.com', 
            'Ian McLayton', 
            'admin'::public.user_role, 
            true
        )
        ON CONFLICT (email) DO UPDATE SET 
            role = 'admin'::public.user_role,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP;
            
        RAISE NOTICE 'Created placeholder admin profile for ian@ianmclayton.com';
    END IF;
    
    -- Also ensure admin@usmbok.com still has admin access (safety check)
    UPDATE public.user_profiles 
    SET 
        role = 'admin'::public.user_role,
        is_active = true,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = 'admin@usmbok.com';
    
    RAISE NOTICE 'Confirmed admin@usmbok.com has admin role';
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error - profiles may already exist with correct roles';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error ensuring admin access: %', SQLERRM;
END $$;

-- Verify admin users
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count
    FROM public.user_profiles
    WHERE role = 'admin'::public.user_role 
    AND email IN ('ian@ianmclayton.com', 'admin@usmbok.com');
    
    RAISE NOTICE 'Total admin users with specified emails: %', admin_count;
END $$;