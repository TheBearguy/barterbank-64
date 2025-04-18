
import { supabase } from '@/integrations/supabase/client';

export interface Contact {
  id: string;
  name: string;
  role: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name: string;
  subject: string;
  content: string;
  created_at: string;
  read: boolean;
  reply_to?: string;
}

export const fetchMessages = async (): Promise<Message[]> => {
  const { data: messages, error } = await supabase
    .rpc('get_messages_for_user')
    
  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return messages || [];
};

export const fetchAvailableContacts = async (userId: string): Promise<Contact[]> => {
  const { data: contacts, error } = await supabase
    .rpc('get_available_contacts', { p_user_id: userId })
    
  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }

  return contacts || [];
};

export const sendMessage = async (
  senderId: string,
  recipientId: string,
  subject: string,
  content: string,
  replyToId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        subject,
        content,
        reply_to: replyToId || null
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};
