-- Location: supabase/migrations/20250102220000_update_trial_credits.sql
-- Schema Analysis: Existing credit system with 100 credits initial bonus
-- Integration Type: modification to increase trial credits to 100k
-- Dependencies: user_profiles, user_credits, credit_transactions tables

-- Update the handle_new_user function to provide 100k trial credits instead of 100
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::public.user_role
  );
  
  -- Initialize user credits with 100k trial credits (7 days trial)
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 100000);
  
  -- Create initial transaction record with trial description
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, balance_after)
  VALUES (NEW.id, 100000, 'initial'::public.transaction_type, 'Welcome trial credits (100k for 7 days)', 100000);
  
  RETURN NEW;
END;
$$;

-- Update existing test users to have 100k trial credits
DO $$
DECLARE
    existing_user_record RECORD;
BEGIN
    -- Update existing users to have 100k credits if they have less
    FOR existing_user_record IN 
        SELECT uc.user_id, uc.balance 
        FROM public.user_credits uc 
        WHERE uc.balance < 100000
    LOOP
        -- Add credits to bring balance up to 100k
        UPDATE public.user_credits 
        SET balance = 100000, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = existing_user_record.user_id;
        
        -- Create transaction record for credit adjustment
        INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, balance_after)
        VALUES (
            existing_user_record.user_id, 
            100000 - existing_user_record.balance, 
            'adjustment'::public.transaction_type, 
            'Trial credit adjustment to 100k', 
            100000
        );
    END LOOP;
    
    RAISE NOTICE 'Updated existing users to 100k trial credits';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating existing user credits: %', SQLERRM;
END $$;