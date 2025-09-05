-- Location: supabase/migrations/20250905044231_admin_assistant_management.sql
-- Schema Analysis: Existing schema has user_profiles, user_credits, credit_transactions, assistants tables
-- Integration Type: Extension - Adding admin functionality and assistant management features
-- Dependencies: user_profiles (existing), assistants (existing)

-- 1. Add Assistant ID field and update assistants table structure
ALTER TABLE public.assistants 
ADD COLUMN IF NOT EXISTS openai_assistant_id TEXT UNIQUE;

ALTER TABLE public.assistants 
ADD COLUMN IF NOT EXISTS knowledge_bank TEXT;

-- Add index for OpenAI assistant ID lookups
CREATE INDEX IF NOT EXISTS idx_assistants_openai_id ON public.assistants(openai_assistant_id);

-- 2. Create subscription tracking table for credit management
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL DEFAULT 'Trial',
    credits_per_month INTEGER NOT NULL DEFAULT 100000,
    monthly_price DECIMAL(10,2) DEFAULT 0.00,
    start_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create daily usage tracking table
CREATE TABLE IF NOT EXISTS public.daily_credit_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    usage_date DATE DEFAULT CURRENT_DATE,
    credits_used INTEGER DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, usage_date)
);

-- 4. Essential indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON public.user_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON public.daily_credit_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_daily_usage_date ON public.daily_credit_usage(usage_date);

-- 5. Functions for credit management
CREATE OR REPLACE FUNCTION public.get_days_remaining(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.user_subscriptions us 
            WHERE us.user_id = user_uuid AND us.is_active = true
        ) THEN
            -- Calculate days remaining for active subscription
            (SELECT GREATEST(0, 
                EXTRACT(DAY FROM (
                    COALESCE(us.end_date, us.start_date + INTERVAL '30 days') - CURRENT_TIMESTAMP
                ))::INTEGER
            ) FROM public.user_subscriptions us 
            WHERE us.user_id = user_uuid AND us.is_active = true 
            ORDER BY us.created_at DESC 
            LIMIT 1)
        ELSE
            -- For trial users, calculate based on current usage rate
            (SELECT GREATEST(0,
                CASE 
                    WHEN avg_daily > 0 THEN 
                        (uc.balance / avg_daily)::INTEGER
                    ELSE 
                        999 -- If no usage yet, show high number
                END
            ) FROM public.user_credits uc
            LEFT JOIN (
                SELECT 
                    user_id,
                    AVG(credits_used) as avg_daily
                FROM public.daily_credit_usage
                WHERE user_id = user_uuid 
                AND usage_date >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY user_id
            ) avg_usage ON avg_usage.user_id = uc.user_id
            WHERE uc.user_id = user_uuid)
    END,
    0
)
$$;

CREATE OR REPLACE FUNCTION public.get_daily_credit_usage(user_uuid UUID, days_back INTEGER DEFAULT 7)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    (SELECT AVG(credits_used)::INTEGER 
     FROM public.daily_credit_usage 
     WHERE user_id = user_uuid 
     AND usage_date >= CURRENT_DATE - days_back::INTEGER
     AND credits_used > 0),
    0
)
$$;

-- 6. Function to track daily usage
CREATE OR REPLACE FUNCTION public.track_daily_usage(user_uuid UUID, credits INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.daily_credit_usage (user_id, usage_date, credits_used, session_count)
    VALUES (user_uuid, CURRENT_DATE, credits, 1)
    ON CONFLICT (user_id, usage_date) 
    DO UPDATE SET 
        credits_used = daily_credit_usage.credits_used + credits,
        session_count = daily_credit_usage.session_count + 1,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- 7. Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_credit_usage ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_subscriptions"
ON public.user_subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_daily_usage"
ON public.daily_credit_usage
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. Admin role-based access using Pattern 6 Option B for assistants table
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = required_role
)
$$;

-- Admin policy for assistants management
CREATE POLICY "admin_manage_assistants"
ON public.assistants
FOR ALL
TO authenticated
USING (public.has_role('admin'))
WITH CHECK (public.has_role('admin'));

-- 10. Update sample data with admin user and proper credits
DO $$
DECLARE
    admin_user_id UUID;
    test_user_id UUID;
BEGIN
    -- Create/Update admin user for ian@ianmclayton.com
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'ian@ianmclayton.com', crypt('AdminPass123', gen_salt('bf', 10)), now(), now(), now(),
        '{"full_name": "Ian Clayton"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    )
    ON CONFLICT (email) DO UPDATE SET
        raw_user_meta_data = '{"full_name": "Ian Clayton"}'::jsonb
    RETURNING id INTO admin_user_id;

    -- Create/Update test user for info@usmbok.com
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'info@usmbok.com', crypt('TestPass123', gen_salt('bf', 10)), now(), now(), now(),
        '{"full_name": "Joe Smith"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    )
    ON CONFLICT (email) DO UPDATE SET
        raw_user_meta_data = '{"full_name": "Joe Smith"}'::jsonb
    RETURNING id INTO test_user_id;

    -- Ensure user profiles exist with correct roles
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES 
        (admin_user_id, 'ian@ianmclayton.com', 'Ian Clayton', 'admin'),
        (test_user_id, 'info@usmbok.com', 'Joe Smith', 'member')
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name;

    -- Ensure test user has 100k credits
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (test_user_id, 100000)
    ON CONFLICT (user_id) DO UPDATE SET
        balance = 100000,
        updated_at = CURRENT_TIMESTAMP;

    -- Create subscription records
    INSERT INTO public.user_subscriptions (user_id, plan_name, credits_per_month, is_active)
    VALUES 
        (admin_user_id, 'Admin', 1000000, true),
        (test_user_id, 'Trial', 100000, true)
    ON CONFLICT DO NOTHING;

    -- Update assistants with the 12 specified knowledge banks and OpenAI IDs
    DELETE FROM public.assistants; -- Clear existing test data
    
    INSERT INTO public.assistants (name, description, domain, knowledge_bank, is_active, openai_assistant_id) VALUES
        ('USMBOK Expert', 'Universal Service Management Body of Knowledge expertise and guidance', 'business', 'USMBOK', true, 'asst_usmbok_001'),
        ('Service Consumer Manager', 'Service consumer relationships and engagement strategies', 'business', 'Service Consumer Management', true, 'asst_scm_001'),
        ('Service Strategy Manager', 'Strategic service planning and portfolio management', 'business', 'Service Strategy Management', true, 'asst_ssm_001'),
        ('Service Performance Manager', 'Performance monitoring and improvement initiatives', 'business', 'Service Performance Management', true, 'asst_spm_001'),
        ('Service Value Manager', 'Value creation and measurement frameworks', 'business', 'Service Value Management', true, 'asst_svm_001'),
        ('Intelligent Automation Expert', 'AI-driven process automation and optimization', 'technology', 'Intelligent Automation', true, 'asst_ia_001'),
        ('Service Experience Manager', 'Customer and user experience optimization', 'business', 'Service Experience Management', true, 'asst_sem_001'),
        ('Service Delivery Manager', 'End-to-end service delivery and execution', 'business', 'Service Delivery Management', true, 'asst_sdm_001'),
        ('Service Operations Manager', 'Day-to-day operational excellence and management', 'business', 'Service Operations Management', true, 'asst_som_001'),
        ('Service Infrastructure Manager', 'Infrastructure planning and lifecycle management', 'technology', 'Service Infrastructure Management', true, 'asst_sim_001'),
        ('ITIL Framework Expert', 'ITIL framework implementation and best practices', 'technology', 'ITIL', true, 'asst_itil_001'),
        ('IT4IT Expert', 'IT4IT reference architecture and operating model', 'technology', 'IT4IT', true, 'asst_it4it_001');

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;