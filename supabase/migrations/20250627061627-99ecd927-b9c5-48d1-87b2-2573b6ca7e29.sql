
-- Create enum for therapy modes
CREATE TYPE public.therapy_mode AS ENUM ('Reflect', 'Recover', 'Rebuild', 'Evolve');

-- Create enum for message senders
CREATE TYPE public.message_sender AS ENUM ('user', 'ai');

-- Create therapy_sessions table
CREATE TABLE public.therapy_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  mode therapy_mode NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create therapy_messages table
CREATE TABLE public.therapy_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.therapy_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender message_sender NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for therapy_sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.therapy_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
  ON public.therapy_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.therapy_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
  ON public.therapy_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for therapy_messages
CREATE POLICY "Users can view their own messages" 
  ON public.therapy_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" 
  ON public.therapy_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
  ON public.therapy_messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
  ON public.therapy_messages 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_therapy_sessions_user_id ON public.therapy_sessions(user_id);
CREATE INDEX idx_therapy_sessions_updated_at ON public.therapy_sessions(updated_at DESC);
CREATE INDEX idx_therapy_messages_session_id ON public.therapy_messages(session_id);
CREATE INDEX idx_therapy_messages_user_id ON public.therapy_messages(user_id);
CREATE INDEX idx_therapy_messages_timestamp ON public.therapy_messages(timestamp DESC);
