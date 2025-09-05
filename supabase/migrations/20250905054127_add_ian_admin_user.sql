-- Location: supabase/migrations/20250905054127_add_ian_admin_user.sql
-- Schema Analysis: Existing user authentication system with user_profiles and user_credits tables
-- Integration Type: Addition - Adding new admin user account
-- Dependencies: auth.users, public.user_profiles, public.user_credits

-- Add ian@ianmclayton.com admin user account
DO $$
DECLARE
    ian_admin_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth user with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (ian_admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'ian@ianmclayton.com', crypt('Password1234!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Ian Clayton", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- The trigger handle_new_user will automatically create the user_profiles and user_credits records
    
    RAISE NOTICE 'Admin user ian@ianmclayton.com created successfully';

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'User ian@ianmclayton.com already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- Verify admin role assignment by updating user_profiles if needed
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Check if the user profile was created with admin role
    SELECT COUNT(*) INTO user_count
    FROM public.user_profiles 
    WHERE email = 'ian@ianmclayton.com' AND role = 'admin'::public.user_role;
    
    -- If user exists but doesn't have admin role, update it
    IF user_count = 0 THEN
        UPDATE public.user_profiles
        SET role = 'admin'::public.user_role,
            full_name = 'Ian Clayton',
            updated_at = CURRENT_TIMESTAMP
        WHERE email = 'ian@ianmclayton.com';
        
        RAISE NOTICE 'Updated ian@ianmclayton.com role to admin';
    ELSE
        RAISE NOTICE 'Admin user ian@ianmclayton.com verified with admin role';
    END IF;
END $$;