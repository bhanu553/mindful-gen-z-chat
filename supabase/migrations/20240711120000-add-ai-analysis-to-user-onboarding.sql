-- Add ai_analysis column to user_onboarding table
ALTER TABLE public.user_onboarding
ADD COLUMN IF NOT EXISTS ai_analysis text; 