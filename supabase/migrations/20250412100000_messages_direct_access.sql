
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
