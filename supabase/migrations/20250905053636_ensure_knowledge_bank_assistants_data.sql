-- Location: supabase/migrations/20250905053636_ensure_knowledge_bank_assistants_data.sql
-- Schema Analysis: Existing assistants table with all required columns and domain_type enum
-- Integration Type: Data population - ensuring the 12 knowledge bank assistants are properly loaded
-- Dependencies: assistants table (existing), domain_type enum (existing)

-- Clear any existing assistants to avoid conflicts
DELETE FROM public.assistants;

-- Insert the 12 knowledge bank assistants with updated names (removing titles) and proper course codes
INSERT INTO public.assistants (name, domain, description, credits_per_message, is_active) VALUES
  (
    'USMBOK',
    'usmbok'::public.domain_type,
    'Universal Service Management Body of Knowledge - comprehensive framework for service management excellence and best practices',
    15,
    true
  ),
  (
    'Service Consumer Management',
    'service_consumer_management'::public.domain_type,
    'Service consumer management strategies, customer experience optimization, and stakeholder relationship management',
    12,
    true
  ),
  (
    'Service Strategy Management',
    'service_strategy_management'::public.domain_type,
    'Strategic planning for service delivery, business alignment, and service portfolio management',
    12,
    true
  ),
  (
    'Service Performance Management',
    'service_performance_management'::public.domain_type,
    'Performance measurement, KPI management, service quality optimization, and continuous improvement',
    12,
    true
  ),
  (
    'Service Value Management',
    'service_value_management'::public.domain_type,
    'Value creation strategies, ROI optimization, and service value proposition development',
    12,
    true
  ),
  (
    'Intelligent Automation',
    'intelligent_automation'::public.domain_type,
    'AI integration, process automation, intelligent workflows, and digital transformation strategies',
    15,
    true
  ),
  (
    'Service Experience Management',
    'service_experience_management'::public.domain_type,
    'Customer experience design, employee experience optimization, and service journey mapping',
    12,
    true
  ),
  (
    'Service Delivery Management',
    'service_delivery_management'::public.domain_type,
    'Service delivery optimization, operational excellence, and delivery process management',
    12,
    true
  ),
  (
    'Service Operations Management',
    'service_operations_management'::public.domain_type,
    'Operational management, incident response, service monitoring, and operational efficiency',
    12,
    true
  ),
  (
    'Service Infrastructure Management',
    'service_infrastructure_management'::public.domain_type,
    'Infrastructure architecture, platform management, and technical service foundation',
    12,
    true
  ),
  (
    'ITIL',
    'itil'::public.domain_type,
    'ITIL (Information Technology Infrastructure Library) framework implementation and best practices',
    15,
    true
  ),
  (
    'IT4IT',
    'it4it'::public.domain_type,
    'IT4IT reference architecture for IT value chain optimization and service management',
    15,
    true
  );

-- Verify the data was inserted
DO $$
DECLARE
    assistant_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO assistant_count FROM public.assistants WHERE is_active = true;
    
    IF assistant_count = 12 THEN
        RAISE NOTICE 'Successfully inserted all 12 knowledge bank assistants';
    ELSE
        RAISE NOTICE 'Warning: Expected 12 assistants, but found %', assistant_count;
    END IF;
END $$;

-- Add a comment to track this data update
COMMENT ON TABLE public.assistants IS 'Knowledge bank assistants populated - 12 domains: USMBOK, Service Management specialties, ITIL, and IT4IT';