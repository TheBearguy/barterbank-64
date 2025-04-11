
-- Create a table for messages
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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- Add row level security policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert messages
CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Policy to allow users to view messages they've sent or received
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Policy to allow users to update messages they've received (to mark as read)
CREATE POLICY "Users can update messages they've received" ON public.messages
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Policy to allow users to delete messages they've sent or received
CREATE POLICY "Users can delete their own messages" ON public.messages
  FOR DELETE 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Create functions for message operations
-- Function to get inbox messages with sender information
CREATE OR REPLACE FUNCTION public.get_inbox_messages(user_id UUID)
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
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    public.messages m
  JOIN 
    public.profiles p ON m.sender_id = p.id
  WHERE 
    m.recipient_id = user_id
  ORDER BY 
    m.created_at DESC;
END;
$$;

-- Function to get sent messages with recipient information
CREATE OR REPLACE FUNCTION public.get_sent_messages(user_id UUID)
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
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    public.messages m
  JOIN 
    public.profiles p ON m.recipient_id = p.id
  WHERE 
    m.sender_id = user_id
  ORDER BY 
    m.created_at DESC;
END;
$$;

-- Function to get user contacts from loan interactions
CREATE OR REPLACE FUNCTION public.get_user_contacts(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT 
    p.id,
    p.name
  FROM 
    public.profiles p
  JOIN 
    public.loans l ON (l.borrower_id = p.id OR l.lender_id = p.id)
  WHERE 
    (l.borrower_id = user_id AND p.id != user_id) OR 
    (l.lender_id = user_id AND p.id != user_id);
END;
$$;

-- Function to send a message
CREATE OR REPLACE FUNCTION public.send_message(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_subject TEXT,
  p_content TEXT,
  p_reply_to UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.messages (
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
$$;

-- Function to mark a message as read
CREATE OR REPLACE FUNCTION public.mark_message_as_read(message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE 
    public.messages
  SET 
    read = true
  WHERE 
    id = message_id AND recipient_id = auth.uid();
END;
$$;

-- Function to delete a message
CREATE OR REPLACE FUNCTION public.delete_message(message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM 
    public.messages
  WHERE 
    id = message_id AND (sender_id = auth.uid() OR recipient_id = auth.uid());
END;
$$;
