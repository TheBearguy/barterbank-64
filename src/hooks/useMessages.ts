
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/components/messaging/MessageList';

export function useMessages() {
  const { user } = useAuth();
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<{id: string, name: string}[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh of the messages
  const refreshMessages = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch inbox and sent messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get user role from metadata
        const userRole = user.user_metadata?.role || '';
        console.log("User role:", userRole);
        
        // Using the SQL query directly via Supabase's edge functions
        const { data: inboxData, error: inboxError } = await supabase.functions.invoke('get-inbox-messages', {
          body: { userId: user.id }
        });
          
        if (inboxError) throw inboxError;
        
        // Format inbox messages
        const formattedInbox = inboxData ? inboxData.map((msg: any) => ({
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
        
        setInboxMessages(formattedInbox);
        
        // Using the SQL query directly via Supabase's edge functions
        const { data: sentData, error: sentError } = await supabase.functions.invoke('get-sent-messages', {
          body: { userId: user.id }
        });
          
        if (sentError) throw sentError;
        
        // Format sent messages
        const formattedSent = sentData ? sentData.map((msg: any) => ({
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
        
        setSentMessages(formattedSent);
        
        // Fetch contacts for message composition, passing user role
        await fetchContacts(userRole);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [user, refreshTrigger]);
  
  // Fetch all users that this user can message based on their role
  const fetchContacts = async (userRole: string) => {
    if (!user) return;
    
    try {
      console.log("Fetching contacts with role:", userRole);
      
      // Using SQL function through Supabase Edge Functions, passing user role
      const { data, error } = await supabase.functions.invoke('get-user-contacts', {
        body: { 
          userId: user.id,
          userRole: userRole
        }
      });
      
      if (error) {
        console.error('Error from get-user-contacts function:', error);
        throw error;
      }
      
      // Log the fetched contacts to debug
      console.log("Contacts fetched:", data);
      
      if (Array.isArray(data)) {
        setContacts(data);
      } else {
        console.warn("Contacts data is not an array:", data);
        setContacts([]);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setContacts([]);
    }
  };
  
  // Send a message
  const sendMessage = async (subject: string, content: string, recipientId: string, replyToId?: string) => {
    if (!user) return false;
    
    try {
      // Use SQL function through Edge Functions
      const { error } = await supabase.functions.invoke('send-message', {
        body: { 
          senderId: user.id,
          recipientId,
          subject,
          content,
          replyToId: replyToId || null
        }
      });
        
      if (error) throw error;
      
      refreshMessages();
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  };
  
  // Mark a message as read
  const markAsRead = async (messageId: string) => {
    try {
      // Use SQL function through Edge Functions
      const { error } = await supabase.functions.invoke('mark-message-as-read', {
        body: { messageId }
      });
        
      if (error) throw error;
      
      // Update local state
      setInboxMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error marking message as read:', err);
      return false;
    }
  };
  
  // Delete a message
  const deleteMessage = async (messageId: string) => {
    try {
      // Use SQL function through Edge Functions
      const { error } = await supabase.functions.invoke('delete-message', {
        body: { messageId }
      });
        
      if (error) throw error;
      
      // Update local state
      setInboxMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      setSentMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      return false;
    }
  };
  
  return {
    inboxMessages,
    sentMessages,
    contacts,
    loading,
    error,
    sendMessage,
    markAsRead,
    deleteMessage,
    refreshMessages
  };
}
