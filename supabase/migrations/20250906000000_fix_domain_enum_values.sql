-- Fix domain enum values to match USM code requirements
-- Add missing domain values and remove incorrect ones

-- First, update existing assistant records with correct domain values
UPDATE public.assistants 
SET domain = 'service_operations_management'::public.domain_type
WHERE domain = 'service_delivery_management'::public.domain_type;

UPDATE public.assistants 
SET domain = 'service_infrastructure_management'::public.domain_type
WHERE domain = 'service_delivery_management'::public.domain_type;

-- Add any missing enum values if needed
-- Note: PostgreSQL doesn't allow removing enum values directly
-- If you need to remove values, you'd need to recreate the enum

-- Add a comment to document the correct mapping
COMMENT ON TYPE public.domain_type IS 'Domain types for USM knowledge areas: 
- usmbok: Universal Service Management Body of Knowledge
- service_consumer_management: USM1XX - Service Consumer Management
- service_strategy_management: USM2XX - Service Strategy Management  
- service_performance_management: USM3XX - Service Performance Management
- service_experience_management: USM4XX - Service Experience Management
- service_delivery_management: USM5XX - Service Delivery Management
- service_operations_management: USM6XX - Service Operations Management
- service_value_management: USM7XX - Service Value Management
- intelligent_automation: USM8XX - Intelligent Automation
- service_infrastructure_management: USMXXX - Service Infrastructure Management
- itil: ITIL Framework
- it4it: IT4IT Architecture
- Legacy domains: technology, healthcare, finance, legal, marketing, education, research, business';

-- Ensure all assistant updates trigger the updated_at timestamp
-- This trigger should already exist, but verify it's working
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS handle_assistants_updated_at ON public.assistants;
CREATE TRIGGER handle_assistants_updated_at
    BEFORE UPDATE ON public.assistants
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();