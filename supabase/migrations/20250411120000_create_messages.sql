
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
