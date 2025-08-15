-- Fix remaining security warnings

-- Fix search path for all functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, is_premium)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    CASE WHEN new.email = 'ucchishth31@gmail.com' THEN true ELSE false END
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_onboarding_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_premium_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service role to update is_premium
  IF OLD.is_premium IS DISTINCT FROM NEW.is_premium THEN
    IF auth.role() != 'service_role' THEN
      RAISE EXCEPTION 'Premium status can only be updated by authorized payment verification';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;