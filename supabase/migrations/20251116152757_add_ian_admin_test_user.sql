-- Location: supabase/migrations/20251116152757_add_ian_admin_test_user.sql
-- Schema Analysis: Complete user management system with user_profiles, user_subscriptions, credit system
-- Integration Type: Addition of admin and subscriber test users for testing access levels + missing user_credits columns
-- Dependencies: user_profiles, user_subscriptions, subscription_plans, user_credits tables

-- First, add missing columns to user_credits table if they don't exist
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS total_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0;

-- Create admin and subscriber test users for testing different access levels
DO $$
DECLARE
    ian_auth_id UUID;
    subscriber_auth_id UUID;
    registered_plan_id UUID;
    subscriber_plan_id UUID;
    ian_existing_id UUID;
    subscriber_existing_id UUID;
    existing_subscription_count INTEGER;
    existing_credits_count INTEGER;
    existing_activity_count INTEGER;
BEGIN
    -- Check if users already exist and get their IDs
    SELECT id INTO ian_existing_id FROM auth.users WHERE email = 'ian@ianmclayton.com';
    SELECT id INTO subscriber_existing_id FROM auth.users WHERE email = 'subscriber@usmbok.com';

    -- Use existing IDs or generate new ones
    ian_auth_id := COALESCE(ian_existing_id, gen_random_uuid());
    subscriber_auth_id := COALESCE(subscriber_existing_id, gen_random_uuid());

    -- Get existing subscription plan IDs
    SELECT id INTO registered_plan_id FROM public.subscription_plans WHERE tier = 'registered' LIMIT 1;
    SELECT id INTO subscriber_plan_id FROM public.subscription_plans WHERE tier = 'subscriber' LIMIT 1;

    -- Create complete auth.users records for testing (fixed conflict handling)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        -- Admin user for testing admin access
        (ian_auth_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'ian@ianmclayton.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Ian Clayton", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        -- Subscriber user for testing subscriber access
        (subscriber_auth_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'subscriber@usmbok.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Subscriber Test User"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (id) DO UPDATE SET
        encrypted_password = crypt('password123', gen_salt('bf', 10)),
        raw_user_meta_data = EXCLUDED.raw_user_meta_data,
        raw_app_meta_data = EXCLUDED.raw_app_meta_data,
        updated_at = now();

    -- Create user profiles (using existing trigger or manual insertion)
    INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
    VALUES
        (ian_auth_id, 'ian@ianmclayton.com', 'Ian Clayton', 'admin', true),
        (subscriber_auth_id, 'subscriber@usmbok.com', 'Subscriber Test User', 'member', true)
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        is_active = EXCLUDED.is_active;

    -- Check if subscriptions already exist for these users
    SELECT COUNT(*) INTO existing_subscription_count 
    FROM public.user_subscriptions 
    WHERE user_id IN (ian_auth_id, subscriber_auth_id);

    -- Only create subscriptions if they don't exist
    IF existing_subscription_count = 0 THEN
        INSERT INTO public.user_subscriptions (user_id, plan_id, tier, status, is_active, started_at, credits_per_month)
        VALUES
            (ian_auth_id, registered_plan_id, 'admin', 'active', true, now(), 1000000),
            (subscriber_auth_id, subscriber_plan_id, 'subscriber', 'active', true, now(), 500000);
    ELSE
        -- Update existing subscriptions
        UPDATE public.user_subscriptions 
        SET tier = CASE 
                    WHEN user_id = ian_auth_id THEN 'admin'::subscription_tier
                    WHEN user_id = subscriber_auth_id THEN 'subscriber'::subscription_tier
                    ELSE tier
                   END,
            status = 'active'::subscription_status,
            credits_per_month = CASE 
                              WHEN user_id = ian_auth_id THEN 1000000
                              WHEN user_id = subscriber_auth_id THEN 500000
                              ELSE credits_per_month
                             END,
            is_active = true
        WHERE user_id IN (ian_auth_id, subscriber_auth_id);
    END IF;

    -- Check if credits already exist for these users
    SELECT COUNT(*) INTO existing_credits_count 
    FROM public.user_credits 
    WHERE user_id IN (ian_auth_id, subscriber_auth_id);

    -- Only create credits if they don't exist
    IF existing_credits_count = 0 THEN
        INSERT INTO public.user_credits (user_id, balance, total_earned, total_spent)
        VALUES
            (ian_auth_id, 1000000, 1000000, 0),
            (subscriber_auth_id, 500000, 500000, 0);
    ELSE
        -- Update existing credits (now that columns exist)
        UPDATE public.user_credits 
        SET balance = CASE 
                       WHEN user_id = ian_auth_id THEN GREATEST(balance, 1000000)
                       WHEN user_id = subscriber_auth_id THEN GREATEST(balance, 500000)
                       ELSE balance
                     END,
            total_earned = CASE 
                            WHEN user_id = ian_auth_id THEN GREATEST(total_earned, 1000000)
                            WHEN user_id = subscriber_auth_id THEN GREATEST(total_earned, 500000)
                            ELSE total_earned
                          END
        WHERE user_id IN (ian_auth_id, subscriber_auth_id);
    END IF;

    -- Check if activity log entries already exist
    SELECT COUNT(*) INTO existing_activity_count 
    FROM public.admin_activity_log 
    WHERE admin_user_id = ian_auth_id 
      AND entity_id IN (ian_auth_id, subscriber_auth_id)
      AND activity_type = 'user_created';

    -- Only create activity log entries if they don't exist
    IF existing_activity_count = 0 THEN
        INSERT INTO public.admin_activity_log (admin_user_id, activity_type, entity_type, entity_id, description, metadata)
        VALUES
            (ian_auth_id, 'user_created', 'user', ian_auth_id, 
             'Admin test user created for access level testing', 
             '{"message": "Admin test user created for access level testing", "role": "admin"}'::jsonb),
            (ian_auth_id, 'user_created', 'user', subscriber_auth_id, 
             'Subscriber test user created for access level testing', 
             '{"message": "Subscriber test user created for access level testing", "role": "subscriber"}'::jsonb);
    END IF;

    RAISE NOTICE 'Test users created/updated successfully:';
    RAISE NOTICE '- Admin: ian@ianmclayton.com / password123';
    RAISE NOTICE '- Subscriber: subscriber@usmbok.com / password123';
END $$;

-- Update existing users to have proper credit balances if needed (now works with all columns)
UPDATE public.user_credits 
SET balance = GREATEST(balance, 100000),
    total_earned = GREATEST(total_earned, 100000)
WHERE balance < 10000;

-- Cleanup function for test data
CREATE OR REPLACE FUNCTION public.cleanup_test_users()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_user_ids UUID[];
BEGIN
    -- Get test user IDs
    SELECT ARRAY_AGG(id) INTO test_user_ids
    FROM auth.users
    WHERE email IN ('ian@ianmclayton.com', 'subscriber@usmbok.com');

    -- Delete in dependency order
    DELETE FROM public.admin_activity_log WHERE admin_user_id = ANY(test_user_ids) OR user_id = ANY(test_user_ids);
    DELETE FROM public.user_credits WHERE user_id = ANY(test_user_ids);
    DELETE FROM public.user_subscriptions WHERE user_id = ANY(test_user_ids);
    DELETE FROM public.user_profiles WHERE id = ANY(test_user_ids);
    DELETE FROM auth.users WHERE id = ANY(test_user_ids);
    
    RAISE NOTICE 'Test users cleaned up successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END $$;