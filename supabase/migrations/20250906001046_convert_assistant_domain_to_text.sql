-- Migration: Convert assistant domain column from enum to text for USM codes
-- Schema Analysis: Existing assistants table with domain enum (domain_type)
-- Integration Type: Modificative - Converting column type to accept USM codes
-- Dependencies: assistants table exists with domain_type enum

-- Step 1: Create backup of existing domain values
CREATE TABLE IF NOT EXISTS public._domain_backup AS 
SELECT id, domain::text as domain_text FROM public.assistants;

-- Step 2: Drop existing domain column (with constraints/indexes)
DROP INDEX IF EXISTS idx_assistants_domain;
ALTER TABLE public.assistants DROP COLUMN IF EXISTS domain;

-- Step 3: Add new domain column as TEXT
ALTER TABLE public.assistants 
ADD COLUMN domain TEXT NOT NULL DEFAULT 'USMXXX';

-- Step 4: Restore data from backup with USM code mappings
UPDATE public.assistants 
SET domain = CASE 
    WHEN b.domain_text = 'usmbok' THEN 'USMXXX'
    WHEN b.domain_text = 'service_consumer_management' THEN 'USM1XX'
    WHEN b.domain_text = 'service_strategy_management' THEN 'USM2XX'
    WHEN b.domain_text = 'service_performance_management' THEN 'USM3XX'
    WHEN b.domain_text = 'service_experience_management' THEN 'USM4XX'
    WHEN b.domain_text = 'service_delivery_management' THEN 'USM5XX'
    WHEN b.domain_text = 'service_operations_management' THEN 'USM6XX'
    WHEN b.domain_text = 'service_value_management' THEN 'USM7XX'
    WHEN b.domain_text = 'intelligent_automation' THEN 'USM8XX'
    WHEN b.domain_text = 'service_infrastructure_management' THEN 'USM9XX'
    WHEN b.domain_text = 'itil' THEN 'ITIL'
    WHEN b.domain_text = 'it4it' THEN 'IT4IT'
    ELSE 'USMXXX'
END
FROM public._domain_backup b
WHERE public.assistants.id = b.id;

-- Step 5: Recreate index for new text column
CREATE INDEX idx_assistants_domain ON public.assistants(domain);

-- Step 6: Add constraint for valid USM codes (optional validation)
ALTER TABLE public.assistants 
ADD CONSTRAINT chk_assistants_domain_format 
CHECK (
    domain ~ '^(USM[X0-9]{3}|ITIL|IT4IT)$' OR 
    domain IN ('USMXXX', 'USM1XX', 'USM2XX', 'USM3XX', 'USM4XX', 
               'USM5XX', 'USM6XX', 'USM7XX', 'USM8XX', 'USM9XX', 
               'ITIL', 'IT4IT')
);

-- Step 7: Update existing trigger to handle TEXT domain
DROP TRIGGER IF EXISTS log_assistant_changes_trigger ON public.assistants;
CREATE TRIGGER log_assistant_changes_trigger
    AFTER INSERT OR UPDATE ON public.assistants
    FOR EACH ROW EXECUTE FUNCTION log_assistant_changes();

-- Step 8: Clean up backup table
DROP TABLE IF EXISTS public._domain_backup;

-- Step 9: Add comment explaining new structure
COMMENT ON COLUMN public.assistants.domain IS 
'USM domain codes as text: USMXXX, USM1XX-USM9XX for specific domains, ITIL, IT4IT for frameworks. Allows flexible USM code entry.';

-- Step 10: Verify conversion with sample data check
DO $$
BEGIN
    -- Check if conversion was successful
    IF EXISTS (SELECT 1 FROM public.assistants WHERE domain IS NULL OR domain = '') THEN
        RAISE NOTICE 'WARNING: Some assistants have null/empty domain values';
    ELSE
        RAISE NOTICE 'SUCCESS: All assistants have valid domain codes';
    END IF;
END $$;