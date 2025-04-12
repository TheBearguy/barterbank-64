
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/messaging/MessageList';

/**
 * Fetches inbox messages for the current user
 */
export const fetchInboxMessages = async (userId: string): Promise<Message[]> => {
  try {
    // First try using Edge Function
    try {
      const { data: inboxData, error: inboxError } = await supabase.functions.invoke('get-inbox-messages', {
        body: { userId }
      });
        
      if (inboxError) throw inboxError;
      
      // Format inbox messages
      return inboxData ? formatMessages(inboxData, 'inbox') : [];
    } catch (functionError) {
      console.error('Edge function error, trying direct RPC call:', functionError);
      
      // Fallback: direct RPC call to get_inbox_messages function
      const { data, error } = await supabase.rpc('get_inbox_messages', { user_id: userId });
        
      if (error) {
        console.error('RPC error:', error);
        // Last resort: log error and return empty array
        console.warn("Message fetching failed: returning empty array");
        return [];
      }
      
      return data ? formatMessagesFromRPC(data, 'inbox') : [];
    }
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    return [];
  }
};

/**
 * Fetches sent messages for the current user
 */
export const fetchSentMessages = async (userId: string): Promise<Message[]> => {
  try {
    // First try using Edge Function
    try {
      const { data: sentData, error: sentError } = await supabase.functions.invoke('get-sent-messages', {
        body: { userId }
      });
        
      if (sentError) throw sentError;
      
      // Format sent messages
      return sentData ? formatMessages(sentData, 'sent') : [];
    } catch (functionError) {
      console.error('Edge function error, trying direct RPC call:', functionError);
      
      // Fallback: direct RPC call to get_sent_messages function
      const { data, error } = await supabase.rpc('get_sent_messages', { user_id: userId });
        
      if (error) {
        console.error('RPC error:', error);
        // Last resort: log error and return empty array
        console.warn("Message fetching failed: returning empty array");
        return [];
      }
      
      return data ? formatMessagesFromRPC(data, 'sent') : [];
    }
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    return [];
  }
};

// Helper function to format messages from edge functions
const formatMessages = (messages: any[], type: 'inbox' | 'sent'): Message[] => {
  if (type === 'inbox') {
    return messages.map((msg: any) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name || 'Unknown',
      recipient_id: msg.recipient_id,
      subject: msg.subject,
      content: msg.content,
      created_at: msg.created_at,
      read: msg.read,
      reply_to: msg.reply_to
    }));
  } else {
    return messages.map((msg: any) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      sender_name: 'You',
      recipient_id: msg.recipient_id,
      recipient_name: msg.recipient_name || 'Unknown',
      subject: msg.subject,
      content: msg.content,
      created_at: msg.created_at,
      read: msg.read,
      reply_to: msg.reply_to
    }));
  }
};

// Helper function to format messages from RPC functions
const formatMessagesFromRPC = (messages: any[], type: 'inbox' | 'sent'): Message[] => {
  if (type === 'inbox') {
    return messages.map((msg: any) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name || 'Unknown',
      recipient_id: msg.recipient_id,
      subject: msg.subject,
      content: msg.content,
      created_at: msg.created_at,
      read: msg.read,
      reply_to: msg.reply_to
    }));
  } else {
    return messages.map((msg: any) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      sender_name: 'You',
      recipient_id: msg.recipient_id,
      recipient_name: msg.recipient_name || 'Unknown',
      subject: msg.subject,
      content: msg.content,
      created_at: msg.created_at,
      read: msg.read,
      reply_to: msg.reply_to
    }));
  }
};

/**
 * Fetches contacts based on user role
 */
export const fetchUserContacts = async (userId: string, userRole: string): Promise<{id: string, name: string}[]> => {
  try {
    console.log("Fetching contacts with role:", userRole);
    
    // Try Edge Function first
    try {
      const { data, error } = await supabase.functions.invoke('get-user-contacts', {
        body: { 
          userId,
          userRole
        }
      });
      
      if (error) throw error;
      
      return formatContacts(data);
    } catch (functionError) {
      console.error('Edge function error, trying direct query:', functionError);
      
      // Fallback: fetch directly from profiles table based on opposite role
      const oppositeRole = userRole === 'lender' ? 'borrower' : 'lender';
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', oppositeRole);
        
      if (error) throw error;
      
      console.log("Fallback contacts query result:", data);
      return formatContacts(data);
    }
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return [];
  }
};

// Helper function to format contacts
const formatContacts = (data: any): {id: string, name: string}[] => {
  if (!data || !Array.isArray(data)) {
    console.warn("Invalid contacts data format:", data);
    return [];
  }
  
  return data.map(contact => ({
    id: contact.id,
    name: contact.name || 'Unknown User'
  }));
};

/**
 * Sends a message
 */
export const sendMessageToUser = async (
  senderId: string, 
  recipientId: string, 
  subject: string, 
  content: string, 
  replyToId?: string
): Promise<boolean> => {
  try {
    // Try Edge Function first
    try {
      const { error } = await supabase.functions.invoke('send-message', {
        body: { 
          senderId,
          recipientId,
          subject,
          content,
          replyToId: replyToId || null
        }
      });
        
      if (error) throw error;
      return true;
    } catch (functionError) {
      console.error('Edge function error, trying direct RPC call:', functionError);
      
      // Fallback: Use RPC function
      const { error } = await supabase.rpc('send_message', {
        p_sender_id: senderId,
        p_recipient_id: recipientId,
        p_subject: subject,
        p_content: content,
        p_reply_to: replyToId || null
      });
        
      if (error) throw error;
      return true;
    }
  } catch (err) {
    console.error('Error sending message:', err);
    return false;
  }
};

/**
 * Marks a message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    // Try Edge Function first
    try {
      const { error } = await supabase.functions.invoke('mark-message-as-read', {
        body: { messageId }
      });
        
      if (error) throw error;
      return true;
    } catch (functionError) {
      console.error('Edge function error, trying direct RPC call:', functionError);
      
      // Fallback: Use direct RPC call to the stored procedure
      const { error } = await supabase.rpc('mark_message_as_read', { message_id: messageId });
      
      if (error) {
        console.error('RPC error:', error);
        return false;
      }
      
      return true;
    }
  } catch (err) {
    console.error('Error marking message as read:', err);
    return false;
  }
};

/**
 * Deletes a message
 */
export const deleteUserMessage = async (messageId: string): Promise<boolean> => {
  try {
    // Try Edge Function first
    try {
      const { error } = await supabase.functions.invoke('delete-message', {
        body: { messageId }
      });
        
      if (error) throw error;
      return true;
    } catch (functionError) {
      console.error('Edge function error, trying direct RPC call:', functionError);
      
      // Fallback: Use RPC call to the stored procedure
      const { error } = await supabase.rpc('delete_message', { message_id: messageId });
      
      if (error) {
        console.error('RPC error:', error);
        return false;
      }
      
      return true;
    }
  } catch (err) {
    console.error('Error deleting message:', err);
    return false;
  }
};
