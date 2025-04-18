
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
    // Use RPC function to send message
    const { error } = await supabase
      .rpc('send_message', {
        p_sender_id: senderId,
        p_recipient_id: recipientId,
        p_subject: subject,
        p_content: content,
        p_reply_to: replyToId || null
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
    // Use RPC function to mark message as read
    const { error } = await supabase
      .rpc('mark_message_as_read', {
        message_id: messageId
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    // Use RPC function to delete message
    const { error } = await supabase
      .rpc('delete_message', {
        message_id: messageId
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};
