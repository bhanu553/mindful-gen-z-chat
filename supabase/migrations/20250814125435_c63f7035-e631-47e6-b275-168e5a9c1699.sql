-- Remove the dangerous public access policy that exposes all user data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Verify that users can still access their own profiles with the existing policy:
-- "Users can view their own profile" policy with (auth.uid() = id) remains active