-- Migration: Add ian@ianmclayton.com user profile
-- Generated: 2025-09-05 14:50:11.285720

-- This migration adds a user profile for ian@ianmclayton.com
-- Since this user already exists in auth.users but not in user_profiles

BEGIN;

-- Create user profile for ian@ianmclayton.com
INSERT INTO public.user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
    '6f5500ca-f4c7-45e9-951c-da316c456a11', -- This is the actual user ID from auth logs
    'ian@ianmclayton.com',
    'Ian Clayton',
    'member'::public.user_role,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

COMMIT;