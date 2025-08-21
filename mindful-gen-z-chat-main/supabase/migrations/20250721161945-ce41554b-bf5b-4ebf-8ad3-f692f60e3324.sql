-- Create user_onboarding table to store intake form data
CREATE TABLE public.user_onboarding (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Personal Details
  full_name text,
  email text,
  phone_number text,
  age integer,
  gender text,
  country text,
  timezone text,
  
  -- Mental Health Status
  previous_therapy boolean,
  therapy_types text[], -- array of therapy types
  current_medication boolean,
  mental_health_rating integer CHECK (mental_health_rating >= 1 AND mental_health_rating <= 10),
  current_struggles text[], -- array of struggles
  other_struggles text,
  
  -- Safety Check
  self_harm_thoughts boolean,
  last_self_harm_occurrence text,
  current_crisis boolean,
  
  -- Consent
  ai_substitute_consent boolean DEFAULT false,
  data_processing_consent boolean DEFAULT false,
  emergency_responsibility_consent boolean DEFAULT false,
  calendar_reminders_consent boolean DEFAULT false,
  
  -- Status
  completed boolean DEFAULT false,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own onboarding data" 
ON public.user_onboarding 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding data" 
ON public.user_onboarding 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data" 
ON public.user_onboarding 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_onboarding_updated_at
    BEFORE UPDATE ON public.user_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_onboarding_updated_at();