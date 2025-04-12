
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/messaging/MessageList';

/**
 * Fetches inbox messages for the current user
 */
export const fetchInboxMessages = async (userId: string): Promise<Message[]> => {
  try {
    const { data: inboxData, error: inboxError } = await supabase.functions.invoke('get-inbox-messages', {
      body: { userId }
    });
      
    if (inboxError) throw inboxError;
    
    // Format inbox messages
    return inboxData ? inboxData.map((msg: any) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name || 'Unknown',
      recipient_id: msg.recipient_id,
      subject: msg.subject,
      content: msg.content,
      created_at: msg.created_at,
      read: msg.read,
      reply_to: msg.reply_to
    })) : [];
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
    const { data: sentData, error: sentError } = await supabase.functions.invoke('get-sent-messages', {
      body: { userId }
    });
      
    if (sentError) throw sentError;
    
    // Format sent messages
    return sentData ? sentData.map((msg: any) => ({
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
    })) : [];
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    return [];
  }
};

/**
 * Fetches contacts based on user role
 */
export const fetchUserContacts = async (userId: string, userRole: string): Promise<{id: string, name: string}[]> => {
  try {
    console.log("Fetching contacts with role:", userRole);
    
    // Using SQL function through Supabase Edge Functions, passing user role
    const { data, error } = await supabase.functions.invoke('get-user-contacts', {
      body: { 
        userId,
        userRole
      }
    });
    
    if (error) {
      console.error('Error from get-user-contacts function:', error);
      
      // Fallback: fetch directly from profiles table
      try {
        console.log("Trying fallback direct database query for contacts");
        const oppositeRole = userRole === 'lender' ? 'borrower' : 'lender';
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('role', oppositeRole);
          
        if (fallbackError) throw fallbackError;
        
        console.log("Fallback contacts query result:", fallbackData);
        return fallbackData || [];
      } catch (fallbackErr) {
        console.error("Fallback contacts query failed:", fallbackErr);
        return [];
      }
    }
    
    // Log the fetched contacts to debug
    console.log("Contacts fetched:", data);
    
    if (Array.isArray(data)) {
      // Make sure all entries have a name property
      return data.map(contact => ({
        id: contact.id,
        name: contact.name || 'Unknown User'
      }));
    } else {
      console.warn("Contacts data is not an array:", data);
      return [];
    }
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return [];
  }
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
    // Use SQL function through Edge Functions
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
    // Use SQL function through Edge Functions
    const { error } = await supabase.functions.invoke('mark-message-as-read', {
      body: { messageId }
    });
      
    if (error) throw error;
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
    // Use SQL function through Edge Functions
    const { error } = await supabase.functions.invoke('delete-message', {
      body: { messageId }
    });
      
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting message:', err);
    return false;
  }
};
