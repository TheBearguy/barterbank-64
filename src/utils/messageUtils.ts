
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/messaging/MessageList';

/**
 * Fetches inbox messages for the current user
 */
export const fetchInboxMessages = async (userId: string): Promise<Message[]> => {
  try {
    // Use Edge Function to get inbox messages
    const { data: inboxData, error: inboxError } = await supabase.functions.invoke('get-inbox-messages', {
      body: { userId }
    });
      
    if (inboxError) {
      console.error('Error fetching inbox messages:', inboxError);
      return [];
    }
    
    // Format inbox messages
    return inboxData ? formatMessages(inboxData, 'inbox') : [];
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
    // Use Edge Function to get sent messages
    const { data: sentData, error: sentError } = await supabase.functions.invoke('get-sent-messages', {
      body: { userId }
    });
      
    if (sentError) {
      console.error('Error fetching sent messages:', sentError);
      return [];
    }
    
    // Format sent messages
    return sentData ? formatMessages(sentData, 'sent') : [];
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    return [];
  }
};

// Helper function to format messages from edge functions
const formatMessages = (messages: any[], type: 'inbox' | 'sent'): Message[] => {
  if (!messages || !Array.isArray(messages)) {
    console.warn('Invalid messages format:', messages);
    return [];
  }

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
    
    // Use Edge Function to get user contacts
    const { data, error } = await supabase.functions.invoke('get-user-contacts', {
      body: { 
        userId,
        userRole
      }
    });
    
    if (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
    
    return formatContacts(data);
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
    console.log("Sending message to:", recipientId, "from:", senderId);
    
    // Validate parameters
    if (!senderId || !recipientId || !subject || !content) {
      console.error("Missing required parameters");
      return false;
    }
    
    // Use Edge Function to send message
    const { data, error } = await supabase.functions.invoke('send-message', {
      body: { 
        senderId,
        recipientId,
        subject,
        content,
        replyToId: replyToId || null
      }
    });
    
    if (error) {
      console.error('Error sending message:', error);
      return false;
    }
    
    if (!data?.success) {
      console.error('Failed to send message:', data?.error || 'Unknown error');
      return false;
    }
    
    console.log('Message sent successfully');
    return true;
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
    // Use Edge Function to mark message as read
    const response = await supabase.functions.invoke('mark-message-as-read', {
      body: { messageId }
    });
    
    if (response.error) {
      console.error('Error marking message as read:', response.error);
      return false;
    }
    
    return true;
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
    // Use Edge Function to delete message
    const response = await supabase.functions.invoke('delete-message', {
      body: { messageId }
    });
    
    if (response.error) {
      console.error('Error deleting message:', response.error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error deleting message:', err);
    return false;
  }
};
