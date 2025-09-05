-- Location: supabase/migrations/20250905050629_update_knowledge_banks_alignment.sql
-- Schema Analysis: Existing assistants table with domain_type enum and sample data
-- Integration Type: Enhancement - Update existing domain types and assistant data  
-- Dependencies: Existing assistants table, domain_type enum

-- Update domain_type enum to align with the 12 specified knowledge banks
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'usmbok';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'service_consumer_management';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'service_strategy_management';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'service_performance_management';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'service_value_management';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'intelligent_automation';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'service_experience_management';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'service_delivery_management';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'service_operations_management';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'service_infrastructure_management';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'itil';
ALTER TYPE public.domain_type ADD VALUE IF NOT EXISTS 'it4it';

-- Clear existing mock assistant data
DELETE FROM public.assistants;

-- Insert the 12 knowledge bank aligned assistants
DO $$
DECLARE
    usmbok_id UUID := gen_random_uuid();
    service_consumer_id UUID := gen_random_uuid();
    service_strategy_id UUID := gen_random_uuid();
    service_performance_id UUID := gen_random_uuid();
    service_value_id UUID := gen_random_uuid();
    intelligent_automation_id UUID := gen_random_uuid();
    service_experience_id UUID := gen_random_uuid();
    service_delivery_id UUID := gen_random_uuid();
    service_operations_id UUID := gen_random_uuid();
    service_infrastructure_id UUID := gen_random_uuid();
    itil_id UUID := gen_random_uuid();
    it4it_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.assistants (id, name, domain, description, credits_per_message, is_active, created_at, updated_at) VALUES
        (usmbok_id, 'USMBOK Expert', 'usmbok'::public.domain_type, 
         'Comprehensive service management expertise based on the Universal Service Management Body of Knowledge framework, covering all aspects of service management best practices.', 
         15, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (service_consumer_id, 'Service Consumer Management Specialist', 'service_consumer_management'::public.domain_type, 
         'Expert in service consumer lifecycle management, customer experience optimization, and consumer-centric service delivery strategies.', 
         12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (service_strategy_id, 'Service Strategy Management Advisor', 'service_strategy_management'::public.domain_type, 
         'Strategic planning and governance expert specializing in service portfolio management, strategic alignment, and service investment optimization.', 
         18, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (service_performance_id, 'Service Performance Management Consultant', 'service_performance_management'::public.domain_type, 
         'Performance measurement and optimization specialist focusing on KPIs, SLAs, service metrics, and continuous improvement methodologies.', 
         14, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (service_value_id, 'Service Value Management Expert', 'service_value_management'::public.domain_type, 
         'Value creation and measurement specialist helping organizations maximize business value through strategic service investments and outcomes.', 
         16, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (intelligent_automation_id, 'Intelligent Automation Specialist', 'intelligent_automation'::public.domain_type, 
         'AI and automation expert focusing on robotic process automation, cognitive computing, and intelligent service automation implementations.', 
         20, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (service_experience_id, 'Service Experience Management Advisor', 'service_experience_management'::public.domain_type, 
         'Customer and employee experience optimization expert specializing in journey mapping, touchpoint analysis, and experience design.', 
         13, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (service_delivery_id, 'Service Delivery Management Specialist', 'service_delivery_management'::public.domain_type, 
         'Operational excellence expert focusing on service delivery processes, resource management, and delivery optimization strategies.', 
         15, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (service_operations_id, 'Service Operations Management Expert', 'service_operations_management'::public.domain_type, 
         'Day-to-day operations specialist covering incident management, problem management, change control, and operational stability.', 
         12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (service_infrastructure_id, 'Service Infrastructure Management Consultant', 'service_infrastructure_management'::public.domain_type, 
         'Infrastructure and technology expert specializing in cloud services, infrastructure optimization, and technical service enablement.', 
         17, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (itil_id, 'ITIL Framework Expert', 'itil'::public.domain_type, 
         'ITIL 4 certified specialist providing comprehensive guidance on Information Technology Infrastructure Library best practices and implementation.', 
         14, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        
        (it4it_id, 'IT4IT Reference Architecture Specialist', 'it4it'::public.domain_type, 
         'IT4IT framework expert focusing on IT value chain optimization, reference architecture implementation, and IT operating model design.', 
         16, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error during assistant creation: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error during assistant creation: %', SQLERRM;
END $$;