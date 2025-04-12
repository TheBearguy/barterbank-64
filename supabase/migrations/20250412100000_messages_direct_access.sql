
-- Ensure messages table exists
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  reply_to UUID REFERENCES public.messages(id)
);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- Add or update RLS policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to view messages they've sent or received
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Allow users to insert their own messages
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Allow users to update messages they've received (to mark as read)
DROP POLICY IF EXISTS "Users can update messages they've received" ON public.messages;
CREATE POLICY "Users can update messages they've received" ON public.messages
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Allow users to delete messages they've sent or received
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Users can delete their own messages" ON public.messages
  FOR DELETE 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Create stored procedures for edge functions to use
CREATE OR REPLACE FUNCTION get_inbox_messages(user_id UUID)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  sender_name TEXT,
  recipient_id UUID,
  subject TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  read BOOLEAN,
  reply_to UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    p.name AS sender_name,
    m.recipient_id,
    m.subject,
    m.content,
    m.created_at,
    m.read,
    m.reply_to
  FROM 
    messages m
  JOIN 
    profiles p ON m.sender_id = p.id
  WHERE 
    m.recipient_id = user_id
  ORDER BY 
    m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_sent_messages(user_id UUID)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  recipient_id UUID,
  recipient_name TEXT,
  subject TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  read BOOLEAN,
  reply_to UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.recipient_id,
    p.name AS recipient_name,
    m.subject,
    m.content,
    m.created_at,
    m.read,
    m.reply_to
  FROM 
    messages m
  JOIN 
    profiles p ON m.recipient_id = p.id
  WHERE 
    m.sender_id = user_id
  ORDER BY 
    m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION send_message(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_subject TEXT,
  p_content TEXT,
  p_reply_to UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO messages (
    sender_id,
    recipient_id,
    subject,
    content,
    created_at,
    read,
    reply_to
  ) VALUES (
    p_sender_id,
    p_recipient_id,
    p_subject,
    p_content,
    now(),
    false,
    p_reply_to
  );
END;
$$ LANGUAGE plpgsql;

