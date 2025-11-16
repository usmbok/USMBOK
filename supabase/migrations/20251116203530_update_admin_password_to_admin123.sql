-- Location: supabase/migrations/20251116203530_update_admin_password_to_admin123.sql
-- Migration: Update admin user password to meet 6-character minimum requirement
-- Schema Analysis: Existing auth.users table with admin@admin.com user
-- Integration Type: Modificative - updating existing admin user password
-- Dependencies: auth.users table with existing admin user

DO $$
DECLARE
    admin_auth_id UUID;
    admin_found BOOLEAN := FALSE;
BEGIN
    -- Find existing admin user
    SELECT id INTO admin_auth_id 
    FROM auth.users 
    WHERE email = 'admin@admin.com';

    -- Check if admin user was found
    IF admin_auth_id IS NOT NULL THEN
        admin_found := TRUE;
        
        -- Update admin password to admin123 (meets 6-character minimum)
        UPDATE auth.users 
        SET encrypted_password = crypt('admin123', gen_salt('bf', 10)),
            updated_at = now()
        WHERE id = admin_auth_id;

        -- Log the password update activity
        INSERT INTO public.admin_activity_log (
            admin_user_id, activity_type, entity_type, entity_id, description, metadata
        ) VALUES (
            admin_auth_id, 'user_updated', 'admin', admin_auth_id, 
            'Admin password updated to meet security requirements', 
            '{"message": "Password updated to admin123 for 6+ character requirement", "old_password_length": 5, "new_password_length": 8}'::jsonb
        ) ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Admin password updated successfully:';
        RAISE NOTICE '- Email: admin@admin.com';
        RAISE NOTICE '- New Password: admin123 (8 characters - meets 6+ requirement)';
        RAISE NOTICE '- Previous Password: admin (5 characters - too short)';
        
    ELSE
        RAISE NOTICE 'Admin user not found. Please run the admin creation migration first.';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating admin password: %', SQLERRM;
        RAISE NOTICE 'Admin user may not exist. Please run admin creation migration first.';
END $$;