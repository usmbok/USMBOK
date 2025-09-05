-- Location: supabase/migrations/20250905183449_admin_activity_logging.sql
-- Schema Analysis: Existing credit_transactions table serves as activity base. User_profiles and assistants tables exist.
-- Integration Type: Extension of existing activity logging system
-- Dependencies: credit_transactions, user_profiles, assistants tables

-- 1. Create enhanced activity types enum to extend existing transaction_type
CREATE TYPE public.activity_type AS ENUM (
    'credit_purchase', 'credit_usage', 'credit_adjustment', 'credit_refund',
    'user_created', 'user_updated', 'user_activated', 'user_deactivated', 'user_role_changed',
    'assistant_created', 'assistant_updated', 'assistant_activated', 'assistant_deactivated'
);

-- 2. Create comprehensive admin activity log table
CREATE TABLE public.admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type public.activity_type NOT NULL,
    entity_type TEXT NOT NULL, -- 'user', 'assistant', 'credit'
    entity_id UUID, -- Can reference user_profiles.id, assistants.id, or credit_transactions.id
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL, -- Who performed the action
    admin_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL, -- Admin who performed the action
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional context data
    amount INTEGER, -- For credit-related activities
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes for efficient querying
CREATE INDEX idx_admin_activity_log_created_at ON public.admin_activity_log(created_at DESC);
CREATE INDEX idx_admin_activity_log_activity_type ON public.admin_activity_log(activity_type);
CREATE INDEX idx_admin_activity_log_entity_type ON public.admin_activity_log(entity_type);
CREATE INDEX idx_admin_activity_log_user_id ON public.admin_activity_log(user_id);
CREATE INDEX idx_admin_activity_log_admin_user_id ON public.admin_activity_log(admin_user_id);

-- 4. Enable RLS
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies - Admin access only
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND (up.role = 'admin' OR up.email = 'ian@ianmclayton.com')
)
$$;

CREATE POLICY "admin_full_access_activity_log"
ON public.admin_activity_log
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 6. Create function to log activities (FIXED parameter order)
CREATE OR REPLACE FUNCTION public.log_admin_activity(
    p_activity_type public.activity_type,
    p_entity_type TEXT,
    p_description TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_amount INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_id UUID;
    current_admin_id UUID;
BEGIN
    -- Get current admin user ID
    SELECT auth.uid() INTO current_admin_id;
    
    -- Insert activity log
    INSERT INTO public.admin_activity_log (
        activity_type,
        entity_type,
        entity_id,
        user_id,
        admin_user_id,
        description,
        metadata,
        amount
    ) VALUES (
        p_activity_type,
        p_entity_type,
        p_entity_id,
        p_user_id,
        current_admin_id,
        p_description,
        p_metadata,
        p_amount
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$;

-- 7. Create triggers to automatically log user profile changes
CREATE OR REPLACE FUNCTION public.log_user_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Handle INSERT (new user)
    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_admin_activity(
            'user_created'::public.activity_type,
            'user',
            'New user account created: ' || NEW.full_name,
            NEW.id,
            NEW.id,
            jsonb_build_object(
                'email', NEW.email,
                'role', NEW.role,
                'is_active', NEW.is_active
            )
        );
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Log role changes
        IF OLD.role != NEW.role THEN
            PERFORM public.log_admin_activity(
                'user_role_changed'::public.activity_type,
                'user',
                'User role changed from ' || OLD.role || ' to ' || NEW.role || ' for ' || NEW.full_name,
                NEW.id,
                NEW.id,
                jsonb_build_object(
                    'old_role', OLD.role,
                    'new_role', NEW.role,
                    'email', NEW.email
                )
            );
        END IF;
        
        -- Log activation status changes
        IF OLD.is_active != NEW.is_active THEN
            IF NEW.is_active THEN
                PERFORM public.log_admin_activity(
                    'user_activated'::public.activity_type,
                    'user',
                    'User account activated: ' || NEW.full_name,
                    NEW.id,
                    NEW.id,
                    jsonb_build_object('email', NEW.email)
                );
            ELSE
                PERFORM public.log_admin_activity(
                    'user_deactivated'::public.activity_type,
                    'user',
                    'User account deactivated: ' || NEW.full_name,
                    NEW.id,
                    NEW.id,
                    jsonb_build_object('email', NEW.email)
                );
            END IF;
        END IF;
        
        -- Log general updates
        IF OLD.full_name != NEW.full_name OR OLD.email != NEW.email THEN
            PERFORM public.log_admin_activity(
                'user_updated'::public.activity_type,
                'user',
                'User profile updated: ' || NEW.full_name,
                NEW.id,
                NEW.id,
                jsonb_build_object(
                    'old_email', OLD.email,
                    'new_email', NEW.email,
                    'old_name', OLD.full_name,
                    'new_name', NEW.full_name
                )
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- 8. Create triggers to automatically log assistant changes
CREATE OR REPLACE FUNCTION public.log_assistant_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Handle INSERT (new assistant)
    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_admin_activity(
            'assistant_created'::public.activity_type,
            'assistant',
            'New assistant created: ' || NEW.name,
            NEW.id,
            NULL,
            jsonb_build_object(
                'domain', NEW.domain,
                'credits_per_message', NEW.credits_per_message,
                'is_active', NEW.is_active
            )
        );
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Log activation status changes
        IF OLD.is_active != NEW.is_active THEN
            IF NEW.is_active THEN
                PERFORM public.log_admin_activity(
                    'assistant_activated'::public.activity_type,
                    'assistant',
                    'Assistant activated: ' || NEW.name,
                    NEW.id,
                    NULL,
                    jsonb_build_object('domain', NEW.domain)
                );
            ELSE
                PERFORM public.log_admin_activity(
                    'assistant_deactivated'::public.activity_type,
                    'assistant',
                    'Assistant deactivated: ' || NEW.name,
                    NEW.id,
                    NULL,
                    jsonb_build_object('domain', NEW.domain)
                );
            END IF;
        END IF;
        
        -- Log general updates
        IF OLD.name != NEW.name OR OLD.description != NEW.description OR OLD.credits_per_message != NEW.credits_per_message THEN
            PERFORM public.log_admin_activity(
                'assistant_updated'::public.activity_type,
                'assistant',
                'Assistant updated: ' || NEW.name,
                NEW.id,
                NULL,
                jsonb_build_object(
                    'old_credits_per_message', OLD.credits_per_message,
                    'new_credits_per_message', NEW.credits_per_message,
                    'domain', NEW.domain
                )
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- 9. Create function to log credit transactions
CREATE OR REPLACE FUNCTION public.log_credit_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_type_mapped public.activity_type;
BEGIN
    -- Map transaction_type to activity_type
    CASE NEW.transaction_type
        WHEN 'purchase' THEN activity_type_mapped := 'credit_purchase'::public.activity_type;
        WHEN 'usage' THEN activity_type_mapped := 'credit_usage'::public.activity_type;
        WHEN 'adjustment' THEN activity_type_mapped := 'credit_adjustment'::public.activity_type;
        WHEN 'refund' THEN activity_type_mapped := 'credit_refund'::public.activity_type;
        ELSE activity_type_mapped := 'credit_adjustment'::public.activity_type;
    END CASE;
    
    -- Log the credit transaction
    PERFORM public.log_admin_activity(
        activity_type_mapped,
        'credit',
        COALESCE(NEW.description, 'Credit transaction: ' || NEW.transaction_type),
        NEW.id,
        NEW.user_id,
        jsonb_build_object(
            'transaction_type', NEW.transaction_type,
            'payment_status', NEW.payment_status,
            'balance_after', NEW.balance_after,
            'payment_id', NEW.payment_id
        ),
        NEW.amount
    );
    
    RETURN NEW;
END;
$$;

-- 10. Create triggers
CREATE TRIGGER log_user_profile_changes_trigger
    AFTER INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_user_profile_changes();

CREATE TRIGGER log_assistant_changes_trigger
    AFTER INSERT OR UPDATE ON public.assistants
    FOR EACH ROW EXECUTE FUNCTION public.log_assistant_changes();

CREATE TRIGGER log_credit_transaction_trigger
    AFTER INSERT ON public.credit_transactions
    FOR EACH ROW EXECUTE FUNCTION public.log_credit_transaction();

-- 11. Create view for unified activity feed
CREATE OR REPLACE VIEW public.unified_activity_feed AS
SELECT 
    id,
    activity_type::text as type,
    entity_type,
    entity_id,
    user_id,
    admin_user_id,
    description,
    metadata,
    amount,
    created_at,
    'activity_log' as source
FROM public.admin_activity_log
UNION ALL
SELECT 
    ct.id,
    ct.transaction_type::text as type,
    'credit' as entity_type,
    ct.id as entity_id,
    ct.user_id,
    NULL as admin_user_id,
    ct.description,
    jsonb_build_object(
        'payment_status', ct.payment_status,
        'payment_id', ct.payment_id,
        'balance_after', ct.balance_after
    ) as metadata,
    ct.amount,
    ct.created_at,
    'credit_transactions' as source
FROM public.credit_transactions ct
WHERE ct.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY created_at DESC;

-- 12. Add some sample activity data for existing records
DO $$
DECLARE
    admin_user_id UUID;
    sample_user_id UUID;
    sample_assistant_id UUID;
BEGIN
    -- Get an admin user (or create activity as system)
    SELECT id INTO admin_user_id 
    FROM public.user_profiles 
    WHERE role = 'admin' OR email = 'ian@ianmclayton.com' 
    LIMIT 1;
    
    -- Get a sample user
    SELECT id INTO sample_user_id 
    FROM public.user_profiles 
    WHERE role != 'admin' 
    LIMIT 1;
    
    -- Get a sample assistant
    SELECT id INTO sample_assistant_id 
    FROM public.assistants 
    LIMIT 1;
    
    -- Create some sample activity entries (if we have data)
    IF admin_user_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
        INSERT INTO public.admin_activity_log (
            activity_type, entity_type, entity_id, user_id, admin_user_id, description, metadata, created_at
        ) VALUES
            ('user_updated'::public.activity_type, 'user', sample_user_id, sample_user_id, admin_user_id, 
             'User profile information updated', '{"action": "profile_sync"}'::jsonb, NOW() - INTERVAL '2 hours'),
            ('user_activated'::public.activity_type, 'user', sample_user_id, sample_user_id, admin_user_id,
             'User account activated by admin', '{"activation_reason": "manual_review_passed"}'::jsonb, NOW() - INTERVAL '1 day');
    END IF;
    
    IF admin_user_id IS NOT NULL AND sample_assistant_id IS NOT NULL THEN
        INSERT INTO public.admin_activity_log (
            activity_type, entity_type, entity_id, user_id, admin_user_id, description, metadata, created_at
        ) VALUES
            ('assistant_updated'::public.activity_type, 'assistant', sample_assistant_id, NULL, admin_user_id,
             'Assistant configuration updated', '{"update_type": "credits_per_message"}'::jsonb, NOW() - INTERVAL '3 hours');
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample data creation skipped: %', SQLERRM;
END $$;