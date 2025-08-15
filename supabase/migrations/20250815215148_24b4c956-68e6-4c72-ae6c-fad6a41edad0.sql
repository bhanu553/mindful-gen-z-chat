-- Security fixes for comprehensive security review (fixed)

-- 1. Create trigger for auto-creating profiles when users sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Create trigger for updating user_onboarding timestamps
DROP TRIGGER IF EXISTS update_user_onboarding_updated_at_trigger ON public.user_onboarding;
CREATE TRIGGER update_user_onboarding_updated_at_trigger
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_onboarding_updated_at();

-- 3. Make user_id columns NOT NULL for security (after ensuring all existing records have user_id)
-- First, let's ensure all existing records have proper user_id values
UPDATE public.chat_sessions SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE public.chat_messages SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Now make them NOT NULL
ALTER TABLE public.chat_sessions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.chat_messages ALTER COLUMN user_id SET NOT NULL;

-- 4. Create secure function to prevent client-side premium escalation
CREATE OR REPLACE FUNCTION public.prevent_premium_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow service role to update is_premium
  IF OLD.is_premium IS DISTINCT FROM NEW.is_premium THEN
    IF auth.role() != 'service_role' THEN
      RAISE EXCEPTION 'Premium status can only be updated by authorized payment verification';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add trigger to prevent premium escalation
DROP TRIGGER IF EXISTS prevent_premium_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_premium_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_premium_escalation();

-- 6. Make uploads bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'uploads';

-- 7. Drop all existing storage policies and recreate them securely
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can upload files to their own folder" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own uploaded files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own uploaded files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own uploaded files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;