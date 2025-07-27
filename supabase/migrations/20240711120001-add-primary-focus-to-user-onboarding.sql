-- Add primary_focus column to user_onboarding table
ALTER TABLE public.user_onboarding ADD COLUMN IF NOT EXISTS primary_focus text;

-- Add comment to describe the column
COMMENT ON COLUMN public.user_onboarding.primary_focus IS 'The primary focus/reason for therapy selected by the user during onboarding'; 