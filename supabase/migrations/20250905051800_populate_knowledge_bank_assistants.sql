-- Location: supabase/migrations/20250905051800_populate_knowledge_bank_assistants.sql
-- Schema Analysis: Existing assistants table with domain (domain_type enum), all 12 knowledge banks defined in enum
-- Integration Type: Data population - adding assistant records for each knowledge bank
-- Dependencies: assistants table (existing), domain_type enum (existing)

-- Clear existing assistants and populate with the 12 knowledge banks
DELETE FROM public.assistants;

-- Insert the 12 knowledge bank assistants with proper descriptions and credits
INSERT INTO public.assistants (name, domain, description, credits_per_message, is_active) VALUES
  (
    'USMBOK Expert',
    'usmbok'::public.domain_type,
    'Expert in US Management Body of Knowledge - comprehensive consulting framework for business management excellence',
    15,
    true
  ),
  (
    'Service Consumer Management Specialist',
    'service_consumer_management'::public.domain_type,
    'Specialized consultant for service consumer management strategies and best practices',
    12,
    true
  ),
  (
    'Service Strategy Management Advisor',
    'service_strategy_management'::public.domain_type,
    'Strategic advisor for service strategy development and implementation',
    12,
    true
  ),
  (
    'Service Performance Management Consultant',
    'service_performance_management'::public.domain_type,
    'Performance optimization expert for service delivery and quality metrics',
    12,
    true
  ),
  (
    'Service Value Management Expert',
    'service_value_management'::public.domain_type,
    'Value creation and management consultant for service-based organizations',
    12,
    true
  ),
  (
    'Intelligent Automation Specialist',
    'intelligent_automation'::public.domain_type,
    'Expert in intelligent automation, AI integration, and process optimization',
    15,
    true
  ),
  (
    'Service Experience Management Consultant',
    'service_experience_management'::public.domain_type,
    'Customer and employee experience optimization expert for service delivery',
    12,
    true
  ),
  (
    'Service Delivery Management Advisor',
    'service_delivery_management'::public.domain_type,
    'Service delivery optimization and management best practices consultant',
    12,
    true
  ),
  (
    'Service Operations Management Expert',
    'service_operations_management'::public.domain_type,
    'Operations management and efficiency expert for service organizations',
    12,
    true
  ),
  (
    'Service Infrastructure Management Specialist',
    'service_infrastructure_management'::public.domain_type,
    'Infrastructure management and architecture consultant for service platforms',
    12,
    true
  ),
  (
    'ITIL Framework Expert',
    'itil'::public.domain_type,
    'ITIL (Information Technology Infrastructure Library) framework specialist and consultant',
    15,
    true
  ),
  (
    'IT4IT Reference Architecture Consultant',
    'it4it'::public.domain_type,
    'IT4IT reference architecture expert for IT value chain optimization',
    15,
    true
  );

-- Add a comment to track this data update
COMMENT ON TABLE public.assistants IS 'Updated with 12 knowledge bank experts - USMBOK, Service Management domains, ITIL, and IT4IT';