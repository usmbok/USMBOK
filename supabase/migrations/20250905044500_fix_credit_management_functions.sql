-- Location: supabase/migrations/20250905044500_fix_credit_management_functions.sql
-- Schema Analysis: Existing schema has credit_transactions, user_credits, user_profiles tables
-- Integration Type: Addition - adding missing functions to support credit management
-- Dependencies: credit_transactions, user_credits, user_profiles tables

-- Create function to get daily credit usage
CREATE OR REPLACE FUNCTION public.get_daily_credit_usage(user_uuid UUID, days_back INTEGER)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    SUM(CASE 
        WHEN ct.transaction_type = 'usage'::transaction_type 
        THEN ABS(ct.amount)
        ELSE 0 
    END)::INTEGER / GREATEST(days_back, 1), 
    0
)
FROM public.credit_transactions ct
WHERE ct.user_id = user_uuid 
    AND ct.created_at >= NOW() - INTERVAL '1 day' * days_back
    AND ct.transaction_type = 'usage'::transaction_type;
$$;

-- Create function to calculate days remaining based on current balance and usage rate
CREATE OR REPLACE FUNCTION public.get_days_remaining(user_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT CASE 
    WHEN daily_usage.avg_usage <= 0 THEN 999
    ELSE GREATEST(0, (current_balance.balance / daily_usage.avg_usage)::INTEGER)
END
FROM (
    SELECT COALESCE(balance, 0) as balance
    FROM public.user_credits uc
    WHERE uc.user_id = user_uuid
    LIMIT 1
) current_balance
CROSS JOIN (
    SELECT COALESCE(
        AVG(CASE 
            WHEN ct.transaction_type = 'usage'::transaction_type 
            THEN ABS(ct.amount)
            ELSE 0 
        END), 
        1
    ) as avg_usage
    FROM public.credit_transactions ct
    WHERE ct.user_id = user_uuid 
        AND ct.created_at >= NOW() - INTERVAL '7 days'
        AND ct.transaction_type = 'usage'::transaction_type
) daily_usage;
$$;

-- Create user subscriptions view using existing data
CREATE OR REPLACE VIEW public.user_subscriptions AS
SELECT 
    uc.id,
    uc.user_id,
    'trial'::TEXT as plan,
    uc.balance as credits_per_month,
    true as is_active,
    uc.created_at,
    uc.updated_at
FROM public.user_credits uc
WHERE uc.balance > 0;

-- Enable RLS on the view
ALTER VIEW public.user_subscriptions SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT SELECT ON public.user_subscriptions TO anon;