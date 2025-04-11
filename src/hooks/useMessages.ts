
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
        
        // Fetch received messages (inbox) using raw SQL query
        const { data: inboxData, error: inboxError } = await supabase
          .rpc('get_inbox_messages', { user_id: user.id })
          .select('*');
          
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
        
        // Fetch sent messages using raw SQL query
        const { data: sentData, error: sentError } = await supabase
          .rpc('get_sent_messages', { user_id: user.id })
          .select('*');
          
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
        
        // Fetch contacts for message composition
        await fetchContacts();
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [user, refreshTrigger]);
  
  // Fetch all users that this user has interacted with
  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      // Find all users this user has had loan interactions with using a custom function
      const { data, error } = await supabase
        .rpc('get_user_contacts', { user_id: user.id })
        .select('id, name');
        
      if (error) throw error;
      
      // Set contacts directly from the result
      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };
  
  // Send a message
  const sendMessage = async (subject: string, content: string, recipientId: string, replyToId?: string) => {
    if (!user) return false;
    
    try {
      // Use a custom function to insert the message
      const { error } = await supabase
        .rpc('send_message', { 
          p_sender_id: user.id,
          p_recipient_id: recipientId,
          p_subject: subject,
          p_content: content,
          p_reply_to: replyToId || null
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
      // Use a custom function to mark the message as read
      const { error } = await supabase
        .rpc('mark_message_as_read', { message_id: messageId });
        
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
      // Use a custom function to delete the message
      const { error } = await supabase
        .rpc('delete_message', { message_id: messageId });
        
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
