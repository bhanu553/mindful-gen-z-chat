-- Complete storage policies setup
CREATE POLICY "secure_uploads_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "secure_uploads_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "secure_uploads_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "secure_uploads_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add function to enforce user_id on insert with proper search path
CREATE OR REPLACE FUNCTION public.enforce_user_id_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure user_id matches authenticated user
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;
  RETURN NEW;
END;
$$;

-- Add triggers to enforce user_id on inserts
DROP TRIGGER IF EXISTS enforce_user_id_chat_sessions ON public.chat_sessions;
CREATE TRIGGER enforce_user_id_chat_sessions
  BEFORE INSERT ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_id_on_insert();

DROP TRIGGER IF EXISTS enforce_user_id_chat_messages ON public.chat_messages;
CREATE TRIGGER enforce_user_id_chat_messages
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_id_on_insert();