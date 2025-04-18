
-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    reply_to UUID REFERENCES public.messages(id)
);

-- Add indexes for better performance
CREATE INDEX messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX messages_created_at_idx ON public.messages(created_at);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
USING (auth.uid() IN (sender_id, recipient_id));

CREATE POLICY "Users can insert messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update read status"
ON public.messages FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (
    auth.uid() = recipient_id 
    AND (
        (OLD.read IS DISTINCT FROM NEW.read)
        OR (OLD.* IS NOT DISTINCT FROM NEW.*)
    )
);

-- Create or replace the send_message function
CREATE OR REPLACE FUNCTION public.send_message(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_subject TEXT,
  p_content TEXT,
  p_reply_to UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO public.messages (
    sender_id,
    recipient_id,
    subject,
    content,
    reply_to
  ) VALUES (
    p_sender_id,
    p_recipient_id,
    p_subject,
    p_content,
    p_reply_to
  )
  RETURNING id INTO v_message_id;
  
  RETURN v_message_id;
END;
$$;

-- Create or replace the mark_message_as_read function
CREATE OR REPLACE FUNCTION public.mark_message_as_read(
  message_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.messages
  SET read = TRUE
  WHERE id = message_id
  AND recipient_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Create or replace the delete_message function
CREATE OR REPLACE FUNCTION public.delete_message(
  message_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.messages
  WHERE id = message_id
  AND (sender_id = auth.uid() OR recipient_id = auth.uid());
  
  RETURN FOUND;
END;
$$;

-- Functions for fetching messages
CREATE OR REPLACE FUNCTION get_messages_for_user()
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    sender_name TEXT,
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
        sender.name AS sender_name,
        m.recipient_id,
        recipient.name AS recipient_name,
        m.subject,
        m.content,
        m.created_at,
        m.read,
        m.reply_to
    FROM messages m
    JOIN profiles sender ON m.sender_id = sender.id
    JOIN profiles recipient ON m.recipient_id = recipient.id
    WHERE m.sender_id = auth.uid() OR m.recipient_id = auth.uid()
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available contacts based on role
CREATE OR REPLACE FUNCTION get_available_contacts(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    role TEXT
) AS $$
BEGIN
    -- Get the role of the current user
    WITH user_role AS (
        SELECT role FROM profiles WHERE id = p_user_id
    )
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.role
    FROM profiles p, user_role ur
    WHERE 
        p.id != p_user_id
        AND (
            (ur.role = 'borrower' AND p.role = 'lender')
            OR
            (ur.role = 'lender' AND p.role = 'borrower')
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
