-- Location: supabase/migrations/20250102225500_add_conversation_history.sql
-- Schema Analysis: user_profiles, user_credits, credit_transactions exist
-- Integration Type: addition/extension
-- Dependencies: user_profiles table (existing)

-- Create new types for conversation management
CREATE TYPE public.conversation_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE public.message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE public.domain_type AS ENUM (
    'technology', 'healthcare', 'finance', 'legal', 
    'marketing', 'education', 'research', 'business'
);

-- Create conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    domain public.domain_type NOT NULL,
    status public.conversation_status DEFAULT 'active'::public.conversation_status,
    total_credits_used INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    role public.message_role NOT NULL,
    content TEXT NOT NULL,
    credits_used INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create assistants table for tracking available AI assistants
CREATE TABLE public.assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    domain public.domain_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    credits_per_message INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add essential indexes for performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_domain ON public.conversations(domain);
CREATE INDEX idx_conversations_last_activity ON public.conversations(last_activity_at);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_role ON public.messages(role);
CREATE INDEX idx_assistants_domain ON public.assistants(domain);
CREATE INDEX idx_assistants_active ON public.assistants(is_active);

-- Add trigger for updating updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Apply triggers to tables that need updated_at
CREATE TRIGGER handle_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_assistants_updated_at
    BEFORE UPDATE ON public.assistants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS for all new tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_conversations"
ON public.conversations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Messages are accessed through conversations relationship
CREATE POLICY "users_access_conversation_messages"
ON public.messages
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
);

-- Assistants are public read, admin write
CREATE POLICY "public_can_read_assistants"
ON public.assistants
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "authenticated_users_read_all_assistants"
ON public.assistants
FOR SELECT
TO authenticated
USING (true);

-- Mock data for demonstration
DO $$
DECLARE
    existing_user_id UUID;
    conversation1_id UUID := gen_random_uuid();
    conversation2_id UUID := gen_random_uuid();
    assistant1_id UUID := gen_random_uuid();
    assistant2_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create sample assistants
        INSERT INTO public.assistants (id, name, description, domain, credits_per_message) VALUES
            (assistant1_id, 'Tech Expert', 'AI assistant specialized in software development and technology consulting', 'technology'::public.domain_type, 15),
            (assistant2_id, 'Finance Advisor', 'AI assistant for investment strategies and financial planning', 'finance'::public.domain_type, 20),
            (gen_random_uuid(), 'Healthcare Consultant', 'AI assistant for medical research and healthcare insights', 'healthcare'::public.domain_type, 25),
            (gen_random_uuid(), 'Legal Advisor', 'AI assistant for legal research and compliance guidance', 'legal'::public.domain_type, 30),
            (gen_random_uuid(), 'Marketing Strategist', 'AI assistant for digital marketing and brand development', 'marketing'::public.domain_type, 18),
            (gen_random_uuid(), 'Education Expert', 'AI assistant for learning methodologies and academic research', 'education'::public.domain_type, 12),
            (gen_random_uuid(), 'Research Assistant', 'AI assistant for scientific research and data analysis', 'research'::public.domain_type, 22),
            (gen_random_uuid(), 'Business Consultant', 'AI assistant for strategy and operations consulting', 'business'::public.domain_type, 20);

        -- Create sample conversations
        INSERT INTO public.conversations (id, user_id, title, domain, total_credits_used, message_count, last_activity_at) VALUES
            (conversation1_id, existing_user_id, 'React Performance Optimization Strategies', 'technology'::public.domain_type, 45, 8, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
            (conversation2_id, existing_user_id, 'Investment Portfolio Diversification Analysis', 'finance'::public.domain_type, 80, 6, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
            (gen_random_uuid(), existing_user_id, 'Digital Marketing Campaign ROI Metrics', 'marketing'::public.domain_type, 54, 9, CURRENT_TIMESTAMP - INTERVAL '6 hours'),
            (gen_random_uuid(), existing_user_id, 'Healthcare Data Privacy Compliance', 'legal'::public.domain_type, 90, 5, CURRENT_TIMESTAMP - INTERVAL '1 day'),
            (gen_random_uuid(), existing_user_id, 'Machine Learning Model Evaluation', 'research'::public.domain_type, 110, 12, CURRENT_TIMESTAMP - INTERVAL '2 days');

        -- Create sample messages for conversations
        INSERT INTO public.messages (conversation_id, role, content, credits_used) VALUES
            -- Tech conversation messages
            (conversation1_id, 'user'::public.message_role, 'What are the best practices for optimizing React component performance?', 0),
            (conversation1_id, 'assistant'::public.message_role, 'Here are the key React performance optimization strategies: 1. Use React.memo for preventing unnecessary re-renders...', 15),
            (conversation1_id, 'user'::public.message_role, 'Can you explain more about useMemo and useCallback?', 0),
            (conversation1_id, 'assistant'::public.message_role, 'Certainly! useMemo and useCallback are crucial hooks for optimization. useMemo memoizes expensive calculations...', 15),
            
            -- Finance conversation messages  
            (conversation2_id, 'user'::public.message_role, 'How should I diversify my investment portfolio for 2025?', 0),
            (conversation2_id, 'assistant'::public.message_role, 'Portfolio diversification in 2025 should focus on several key areas: geographic diversification, sector allocation...', 20),
            (conversation2_id, 'user'::public.message_role, 'What percentage should I allocate to emerging markets?', 0),
            (conversation2_id, 'assistant'::public.message_role, 'For emerging markets allocation, consider 10-20% of your equity portfolio depending on your risk tolerance...', 20);
        
        RAISE NOTICE 'Sample conversation data created successfully for user: %', existing_user_id;
    ELSE
        RAISE NOTICE 'No existing users found. Create user profiles first.';
    END IF;
END $$;