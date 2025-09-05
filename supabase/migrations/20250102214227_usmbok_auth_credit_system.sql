-- Location: supabase/migrations/20250102214227_usmbok_auth_credit_system.sql
-- Schema Analysis: No existing schema found
-- Integration Type: Complete authentication and credit management system
-- Dependencies: auth.users (Supabase auth system)

-- 1. Types and Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'premium', 'member');
CREATE TYPE public.transaction_type AS ENUM ('initial', 'purchase', 'usage', 'bonus', 'refund', 'adjustment');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 2. Core Tables
-- User profiles table (intermediary for PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'member'::public.user_role,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User credits table for credit balance management
CREATE TABLE public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Credit transactions table for credit history tracking
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type public.transaction_type NOT NULL,
    description TEXT,
    balance_after INTEGER NOT NULL,
    payment_id TEXT,
    payment_status public.payment_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(transaction_type);

-- 4. Functions (MUST BE BEFORE RLS POLICIES)
-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::public.user_role
  );
  
  -- Initialize user credits with welcome bonus
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 100);
  
  -- Create initial transaction record
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, balance_after)
  VALUES (NEW.id, 100, 'initial'::public.transaction_type, 'Welcome bonus credits', 100);
  
  RETURN NEW;
END;
$$;

-- Function to add credits to user account
CREATE OR REPLACE FUNCTION public.add_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_transaction_type TEXT DEFAULT 'purchase'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User credit account not found';
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + p_amount;
  
  -- Update user credits
  UPDATE public.user_credits
  SET balance = new_balance, updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, balance_after)
  VALUES (p_user_id, p_amount, p_transaction_type::public.transaction_type, p_description, new_balance)
  RETURNING id INTO transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_balance,
    'new_balance', new_balance,
    'amount_added', p_amount
  );
END;
$$;

-- Function to deduct credits from user account
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_transaction_type TEXT DEFAULT 'usage'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User credit account not found';
  END IF;
  
  IF current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Current balance: %, Required: %', current_balance, p_amount;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - p_amount;
  
  -- Update user credits
  UPDATE public.user_credits
  SET balance = new_balance, updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;
  
  -- Create transaction record (negative amount for deduction)
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, balance_after)
  VALUES (p_user_id, -p_amount, p_transaction_type::public.transaction_type, p_description, new_balance)
  RETURNING id INTO transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_balance,
    'new_balance', new_balance,
    'amount_deducted', p_amount
  );
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Using Pattern 1 for Core User Tables)
-- Pattern 1: Core user table - Simple, direct column reference
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for credit tables
CREATE POLICY "users_manage_own_user_credits"
ON public.user_credits
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_credit_transactions"
ON public.credit_transactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Mock Data for Testing
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@usmbok.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@usmbok.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Regular User", "role": "member"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- 10. Cleanup function for testing
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs to delete
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@usmbok.com';

    -- Delete in dependency order (children first)
    DELETE FROM public.credit_transactions WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_credits WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);

    -- Delete auth.users last
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);

    RAISE NOTICE 'Test data cleanup completed';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;