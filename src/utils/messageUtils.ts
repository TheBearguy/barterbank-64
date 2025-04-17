
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/messaging/MessageList';

/**
 * Fetches inbox messages for the current user
 */
export const fetchInboxMessages = async (userId: string): Promise<Message[]> => {
  try {
    console.log("Fetching inbox messages for user:", userId);
    
    // Use Edge Function to get inbox messages
    const { data, error } = await supabase.functions.invoke('get-inbox-messages', {
      body: { userId }
    });
    
    if (error) {
      console.error('Error fetching inbox messages from Edge Function:', error);
      throw error;
    }
    
    // Format and return inbox messages
    return data && Array.isArray(data) ? formatMessages(data, 'inbox') : [];
  } catch (error) {
    console.error('Error in fetchInboxMessages:', error);
    throw error; // Let the calling function handle fallback
  }
};

/**
 * Fetches sent messages for the current user
 */
export const fetchSentMessages = async (userId: string): Promise<Message[]> => {
  try {
    console.log("Fetching sent messages for user:", userId);
    
    // Use Edge Function to get sent messages
    const { data, error } = await supabase.functions.invoke('get-sent-messages', {
      body: { userId }
    });
    
    if (error) {
      console.error('Error fetching sent messages from Edge Function:', error);
      throw error;
    }
    
    // Format and return sent messages
    return data && Array.isArray(data) ? formatMessages(data, 'sent') : [];
  } catch (error) {
    console.error('Error in fetchSentMessages:', error);
    throw error; // Let the calling function handle fallback
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
    
    if (!userId) {
      console.warn("No user ID provided");
      throw new Error("User ID is required");
    }
    
    // Use Edge Function to get user contacts
    const { data, error } = await supabase.functions.invoke('get-user-contacts', {
      body: { 
        userId,
        userRole
      }
    });
    
    if (error) {
      console.error('Error fetching contacts from Edge Function:', error);
      throw error;
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn('No contacts returned from Edge Function or invalid format');
      throw new Error('Invalid data format from Edge Function');
    }
    
    const formattedContacts = formatContacts(data);
    console.log('Successfully fetched contacts:', formattedContacts);
    return formattedContacts;
  } catch (error) {
    console.error('Error in fetchUserContacts:', error);
    throw error; // Let the calling function handle fallback
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
      console.error('Error invoking send-message function:', error);
      throw error;
    }
    
    console.log('Message sent successfully');
    return true;
  } catch (err) {
    console.error('Error in sendMessageToUser:', err);
    throw err; // Let the calling function handle fallback
  }
};

/**
 * Marks a message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    console.log("Marking message as read:", messageId);
    
    // Use Edge Function to mark message as read
    const { data, error } = await supabase.functions.invoke('mark-message-as-read', {
      body: { messageId }
    });
    
    if (error) {
      console.error('Error invoking mark-message-as-read function:', error);
      throw error;
    }
    
    console.log('Message marked as read successfully');
    return true;
  } catch (err) {
    console.error('Error in markMessageAsRead:', err);
    throw err; // Let the calling function handle fallback
  }
};

/**
 * Deletes a message
 */
export const deleteUserMessage = async (messageId: string): Promise<boolean> => {
  try {
    console.log("Deleting message:", messageId);
    
    // Use Edge Function to delete message
    const { data, error } = await supabase.functions.invoke('delete-message', {
      body: { messageId }
    });
    
    if (error) {
      console.error('Error invoking delete-message function:', error);
      throw error;
    }
    
    console.log('Message deleted successfully');
    return true;
  } catch (err) {
    console.error('Error in deleteUserMessage:', err);
    throw err; // Let the calling function handle fallback
  }
};
