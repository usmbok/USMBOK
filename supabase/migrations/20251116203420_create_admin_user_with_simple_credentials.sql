-- Location: supabase/migrations/20251116203420_create_admin_user_with_simple_credentials.sql
-- Migration: Create admin user with username 'admin' and password 'admin' for full edit and admin access
-- Dependencies: user_profiles, user_subscriptions, subscription_plans, user_credits tables

DO $$
DECLARE
    admin_auth_id UUID;
    unlimited_plan_id UUID;
    admin_existing_id UUID;
    existing_subscription_count INTEGER;
    existing_credits_count INTEGER;
    existing_profile_count INTEGER;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_existing_id FROM auth.users WHERE email = 'admin@admin.com';

    -- Use existing ID or generate new one
    admin_auth_id := COALESCE(admin_existing_id, gen_random_uuid());

    -- Get unlimited subscription plan ID or create one
    SELECT id INTO unlimited_plan_id FROM public.subscription_plans WHERE tier = 'unlimited' LIMIT 1;
    
    -- If no unlimited plan exists, create one
    IF unlimited_plan_id IS NULL THEN
        INSERT INTO public.subscription_plans (
            id, name, description, price, billing_cycle, tier, credits_per_month, 
            is_active, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), 'Unlimited Admin Plan', 'Unlimited access for administrators', 
            0.00, 'unlimited', 'unlimited', 999999999, 
            true, now(), now()
        ) RETURNING id INTO unlimited_plan_id;
    END IF;

    -- Create/update admin user in auth.users with simple credentials
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        admin_auth_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin@admin.com', crypt('admin', gen_salt('bf', 10)), now(), now(), now(),
        '{"full_name": "Administrator", "role": "admin", "username": "admin"}'::jsonb, 
        '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    ) ON CONFLICT (id) DO UPDATE SET
        encrypted_password = crypt('admin', gen_salt('bf', 10)),
        raw_user_meta_data = '{"full_name": "Administrator", "role": "admin", "username": "admin"}'::jsonb,
        raw_app_meta_data = '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
        updated_at = now();

    -- Check if profile already exists
    SELECT COUNT(*) INTO existing_profile_count 
    FROM public.user_profiles 
    WHERE id = admin_auth_id;

    -- Create/update user profile with admin role
    IF existing_profile_count = 0 THEN
        INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
        VALUES (admin_auth_id, 'admin@admin.com', 'Administrator', 'admin', true);
    ELSE
        UPDATE public.user_profiles 
        SET role = 'admin', 
            full_name = 'Administrator',
            is_active = true
        WHERE id = admin_auth_id;
    END IF;

    -- Check if subscription already exists
    SELECT COUNT(*) INTO existing_subscription_count 
    FROM public.user_subscriptions 
    WHERE user_id = admin_auth_id;

    -- Create/update subscription with unlimited access
    IF existing_subscription_count = 0 THEN
        INSERT INTO public.user_subscriptions (
            user_id, plan_id, tier, status, is_active, started_at, 
            credits_per_month, expires_at, auto_renewal
        ) VALUES (
            admin_auth_id, unlimited_plan_id, 'unlimited', 'active', true, now(), 
            999999999, null, true
        );
    ELSE
        UPDATE public.user_subscriptions 
        SET tier = 'unlimited'::subscription_tier,
            status = 'active'::subscription_status,
            credits_per_month = 999999999,
            is_active = true,
            expires_at = null,
            auto_renewal = true
        WHERE user_id = admin_auth_id;
    END IF;

    -- Check if credits already exist
    SELECT COUNT(*) INTO existing_credits_count 
    FROM public.user_credits 
    WHERE user_id = admin_auth_id;

    -- Create/update credits with unlimited balance
    IF existing_credits_count = 0 THEN
        INSERT INTO public.user_credits (user_id, balance, total_earned, total_spent)
        VALUES (admin_auth_id, 999999999, 999999999, 0);
    ELSE
        UPDATE public.user_credits 
        SET balance = 999999999,
            total_earned = 999999999,
            total_spent = 0
        WHERE user_id = admin_auth_id;
    END IF;

    -- Log admin creation activity
    INSERT INTO public.admin_activity_log (
        admin_user_id, activity_type, entity_type, entity_id, description, metadata
    ) VALUES (
        admin_auth_id, 'user_created', 'admin', admin_auth_id, 
        'Admin user created with unlimited access', 
        '{"message": "Admin user created with simple credentials", "username": "admin", "role": "admin"}'::jsonb
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Admin user created/updated successfully:';
    RAISE NOTICE '- Username: admin';
    RAISE NOTICE '- Email: admin@admin.com';  
    RAISE NOTICE '- Password: admin';
    RAISE NOTICE '- Role: admin with unlimited credits';
END $$;

-- Ensure unlimited tier exists in subscription_tier enum
DO $$
BEGIN
    -- Check if unlimited tier exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'unlimited' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
    ) THEN
        ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'unlimited';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Value already exists, ignore
        NULL;
END $$;