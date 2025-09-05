-- Location: supabase/migrations/20250905060216_enhanced_subscription_management.sql
-- Schema Analysis: Existing user_profiles, user_subscriptions, user_credits, credit_transactions tables
-- Integration Type: Enhancement - Adding subscription plans, billing simulation, and enhanced management
-- Dependencies: user_profiles, user_subscriptions, user_credits, credit_transactions (existing)

-- 1. Create enhanced subscription plan types
CREATE TYPE public.subscription_tier AS ENUM ('registered', 'subscriber', 'founder', 'admin');
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'yearly', 'one_time', 'unlimited');
CREATE TYPE public.subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired', 'trial');
CREATE TYPE public.plan_change_type AS ENUM ('upgrade', 'downgrade', 'renewal', 'cancellation');

-- 2. Create subscription plans table
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier public.subscription_tier NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
    credits_per_month INTEGER NOT NULL,
    trial_days INTEGER DEFAULT 0,
    billing_cycle public.billing_cycle NOT NULL DEFAULT 'monthly',
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Enhance user_subscriptions table with new columns
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS tier public.subscription_tier,
ADD COLUMN IF NOT EXISTS status public.subscription_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_cycle public.billing_cycle DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS price_paid DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS cancellation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 4. Create subscription plan changes history table
CREATE TABLE public.subscription_plan_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    from_tier public.subscription_tier,
    to_tier public.subscription_tier NOT NULL,
    change_type public.plan_change_type NOT NULL,
    previous_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    effective_date TIMESTAMPTZ NOT NULL,
    prorated_amount DECIMAL(10,2) DEFAULT 0,
    reason TEXT,
    processed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create billing simulation table for Stripe-less payment processing
CREATE TABLE public.billing_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_tier public.subscription_tier NOT NULL,
    amount_usd DECIMAL(10,2) NOT NULL,
    simulation_type TEXT NOT NULL, -- 'subscription', 'upgrade', 'credit_purchase'
    payment_method_type TEXT DEFAULT 'card', -- 'card', 'bank', 'paypal' (simulated)
    payment_status public.payment_status DEFAULT 'pending',
    simulation_data JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create admin activity logs table
CREATE TABLE public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'plan_change', 'credit_adjustment', 'subscription_override'
    action_description TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Essential Indexes
CREATE INDEX idx_subscription_plans_tier ON public.subscription_plans(tier);
CREATE INDEX idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX idx_user_subscriptions_tier ON public.user_subscriptions(tier);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_trial_end ON public.user_subscriptions(trial_end_date);
CREATE INDEX idx_subscription_plan_changes_user_id ON public.subscription_plan_changes(user_id);
CREATE INDEX idx_subscription_plan_changes_effective_date ON public.subscription_plan_changes(effective_date);
CREATE INDEX idx_billing_simulations_user_id ON public.billing_simulations(user_id);
CREATE INDEX idx_billing_simulations_expires_at ON public.billing_simulations(expires_at);
CREATE INDEX idx_admin_activity_logs_admin_user_id ON public.admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_logs_target_user_id ON public.admin_activity_logs(target_user_id);

-- 8. Enhanced subscription management functions
CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    GREATEST(0, 
        EXTRACT(days FROM (us.trial_end_date - CURRENT_TIMESTAMP))::INTEGER
    ), 
    0
) 
FROM public.user_subscriptions us
WHERE us.user_id = user_uuid 
AND us.is_active = true
AND us.status IN ('trial', 'active')
LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_subscription_details(user_uuid UUID)
RETURNS TABLE(
    tier TEXT,
    status TEXT,
    credits_per_month INTEGER,
    trial_days_remaining INTEGER,
    next_billing_date TIMESTAMPTZ,
    auto_renewal BOOLEAN,
    price_paid DECIMAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    COALESCE(us.tier::TEXT, 'registered'::TEXT),
    COALESCE(us.status::TEXT, 'active'::TEXT),
    COALESCE(sp.credits_per_month, 100000),
    public.get_trial_days_remaining(user_uuid),
    us.next_billing_date,
    COALESCE(us.auto_renewal, true),
    us.price_paid
FROM public.user_profiles up
LEFT JOIN public.user_subscriptions us ON up.id = us.user_id AND us.is_active = true
LEFT JOIN public.subscription_plans sp ON us.tier = sp.tier
WHERE up.id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.simulate_subscription_change(
    user_uuid UUID,
    new_tier public.subscription_tier,
    payment_method TEXT DEFAULT 'card'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    simulation_id UUID;
    plan_price DECIMAL;
    current_tier public.subscription_tier;
BEGIN
    -- Get current tier and new plan price
    SELECT COALESCE(us.tier, 'registered'::public.subscription_tier)
    INTO current_tier
    FROM public.user_subscriptions us
    WHERE us.user_id = user_uuid AND us.is_active = true;
    
    SELECT sp.price_usd INTO plan_price
    FROM public.subscription_plans sp
    WHERE sp.tier = new_tier AND sp.is_active = true;
    
    -- Create billing simulation
    INSERT INTO public.billing_simulations (
        user_id, subscription_tier, amount_usd, 
        simulation_type, payment_method_type, simulation_data
    ) VALUES (
        user_uuid, new_tier, plan_price,
        CASE 
            WHEN current_tier = 'registered' THEN 'subscription'
            ELSE 'upgrade'
        END,
        payment_method,
        jsonb_build_object(
            'from_tier', current_tier,
            'to_tier', new_tier,
            'simulation_time', CURRENT_TIMESTAMP
        )
    ) RETURNING id INTO simulation_id;
    
    RETURN simulation_id;
END;
$func$;

CREATE OR REPLACE FUNCTION public.process_subscription_change(
    user_uuid UUID,
    new_tier public.subscription_tier,
    admin_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    current_subscription RECORD;
    new_plan RECORD;
    change_record_id UUID;
BEGIN
    -- Get current subscription
    SELECT * INTO current_subscription
    FROM public.user_subscriptions us
    WHERE us.user_id = user_uuid AND us.is_active = true;
    
    -- Get new plan details
    SELECT * INTO new_plan
    FROM public.subscription_plans sp
    WHERE sp.tier = new_tier AND sp.is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid subscription tier or plan not active';
    END IF;
    
    -- Log the change
    INSERT INTO public.subscription_plan_changes (
        user_id, from_tier, to_tier, change_type,
        previous_price, new_price, effective_date, processed_by
    ) VALUES (
        user_uuid,
        current_subscription.tier,
        new_tier,
        CASE 
            WHEN current_subscription.tier IS NULL OR current_subscription.tier = 'registered' 
                THEN 'upgrade'::public.plan_change_type
            WHEN new_plan.price_usd > COALESCE(current_subscription.price_paid, 0) 
                THEN 'upgrade'::public.plan_change_type
            ELSE 'downgrade'::public.plan_change_type
        END,
        current_subscription.price_paid,
        new_plan.price_usd,
        CURRENT_TIMESTAMP,
        admin_user_id
    ) RETURNING id INTO change_record_id;
    
    -- Update or insert subscription
    INSERT INTO public.user_subscriptions (
        user_id, tier, status, credits_per_month, billing_cycle,
        price_paid, next_billing_date, auto_renewal, is_active
    ) VALUES (
        user_uuid, new_tier, 'active'::public.subscription_status,
        new_plan.credits_per_month, new_plan.billing_cycle,
        new_plan.price_usd, 
        CURRENT_TIMESTAMP + INTERVAL '1 month',
        true, true
    )
    ON CONFLICT (user_id) WHERE is_active = true
    DO UPDATE SET
        tier = EXCLUDED.tier,
        status = EXCLUDED.status,
        credits_per_month = EXCLUDED.credits_per_month,
        price_paid = EXCLUDED.price_paid,
        next_billing_date = EXCLUDED.next_billing_date,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Update user credits if needed
    UPDATE public.user_credits
    SET balance = GREATEST(balance, new_plan.credits_per_month),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = user_uuid;
    
    -- Log admin activity if performed by admin
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.admin_activity_logs (
            admin_user_id, target_user_id, action_type, action_description,
            after_state
        ) VALUES (
            admin_user_id, user_uuid, 'plan_change',
            format('Changed user subscription to %s tier', new_tier),
            jsonb_build_object(
                'new_tier', new_tier,
                'credits_per_month', new_plan.credits_per_month,
                'price_usd', new_plan.price_usd
            )
        );
    END IF;
    
    RETURN true;
END;
$func$;

-- 9. Enable RLS on all new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plan_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies using Pattern 2 (Simple User Ownership) and Pattern 6 (Role-Based Access)

-- Subscription plans - Public read, admin write
CREATE POLICY "public_can_read_subscription_plans"
ON public.subscription_plans
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_can_manage_subscription_plans"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- Subscription plan changes - Users can view own, admins can view all
CREATE POLICY "users_can_view_own_plan_changes"
ON public.subscription_plan_changes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admin_can_view_all_plan_changes"
ON public.subscription_plan_changes
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

CREATE POLICY "admin_can_create_plan_changes"
ON public.subscription_plan_changes
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- Billing simulations - Users manage own
CREATE POLICY "users_manage_own_billing_simulations"
ON public.billing_simulations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin activity logs - Admins only
CREATE POLICY "admin_can_manage_activity_logs"
ON public.admin_activity_logs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- 11. Create triggers for updated_at columns
CREATE TRIGGER handle_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 12. Insert default subscription plans
DO $$
BEGIN
    INSERT INTO public.subscription_plans (tier, name, description, price_usd, credits_per_month, trial_days, billing_cycle, features) VALUES
        (
            'registered'::public.subscription_tier,
            'Registered',
            'Free tier with trial credits and 7-day trial period',
            0.00,
            100000, -- 100k credits
            7, -- 7-day trial
            'monthly'::public.billing_cycle,
            '["7-day trial", "100k monthly credits", "Basic support", "Community access"]'::jsonb
        ),
        (
            'subscriber'::public.subscription_tier,
            'Subscriber',
            'Monthly subscription with 1M credits',
            29.99,
            1000000, -- 1M credits
            0,
            'monthly'::public.billing_cycle,
            '["1M monthly credits", "Priority support", "Advanced features", "API access"]'::jsonb
        ),
        (
            'founder'::public.subscription_tier,
            'Founder',
            'Premium subscription with 5M credits',
            99.99,
            5000000, -- 5M credits
            0,
            'monthly'::public.billing_cycle,
            '["5M monthly credits", "Premium support", "All features", "Custom integrations", "Early access"]'::jsonb
        ),
        (
            'admin'::public.subscription_tier,
            'Admin',
            'Administrative access with unlimited credits',
            0.00,
            999999999, -- Unlimited (high number)
            0,
            'unlimited'::public.billing_cycle,
            '["Unlimited credits", "Administrative access", "User management", "System configuration"]'::jsonb
        );
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Subscription plans already exist, skipping insert';
END $$;

-- 13. Update existing user subscriptions with tier information
DO $$
BEGIN
    UPDATE public.user_subscriptions 
    SET 
        tier = CASE 
            WHEN plan = 'trial' THEN 'registered'::public.subscription_tier
            WHEN plan = 'basic' THEN 'subscriber'::public.subscription_tier
            WHEN plan = 'premium' THEN 'founder'::public.subscription_tier
            ELSE 'registered'::public.subscription_tier
        END,
        status = CASE 
            WHEN is_active = true THEN 'active'::public.subscription_status
            ELSE 'cancelled'::public.subscription_status
        END,
        billing_cycle = 'monthly'::public.billing_cycle
    WHERE tier IS NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating existing subscriptions: %', SQLERRM;
END $$;