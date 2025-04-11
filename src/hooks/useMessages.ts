
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
          .from('messages')
          .select(`
            id,
            sender_id,
            recipient_id,
            subject,
            content,
            created_at,
            read,
            reply_to,
            sender:profiles!sender_id(id, name)
          `)
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });
          
        if (inboxError) throw inboxError;
        
        // Format inbox messages
        const formattedInbox = inboxData.map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender_name: msg.sender?.name || 'Unknown',
          recipient_id: msg.recipient_id,
          subject: msg.subject,
          content: msg.content,
          created_at: msg.created_at,
          read: msg.read,
          reply_to: msg.reply_to
        }));
        
        setInboxMessages(formattedInbox);
        
        // Fetch sent messages using raw SQL query
        const { data: sentData, error: sentError } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            recipient_id,
            subject,
            content,
            created_at,
            read,
            reply_to,
            recipient:profiles!recipient_id(id, name)
          `)
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });
          
        if (sentError) throw sentError;
        
        // Format sent messages
        const formattedSent = sentData.map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender_name: 'You',
          recipient_id: msg.recipient_id,
          recipient_name: msg.recipient?.name || 'Unknown',
          subject: msg.subject,
          content: msg.content,
          created_at: msg.created_at,
          read: msg.read,
          reply_to: msg.reply_to
        }));
        
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
      // Find all users this user has had loan interactions with
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select(`
          borrower_id,
          lender_id,
          borrower:profiles!borrower_id(id, name),
          lender:profiles!lender_id(id, name)
        `)
        .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`);
        
      if (loansError) throw loansError;
      
      // Extract unique contacts
      const uniqueContacts = new Map();
      
      loansData.forEach(loan => {
        // If user is borrower, add lender as contact
        if (loan.borrower_id === user.id && loan.lender && loan.lender.id) {
          uniqueContacts.set(loan.lender.id, {
            id: loan.lender.id,
            name: loan.lender.name
          });
        }
        
        // If user is lender, add borrower as contact
        if (loan.lender_id === user.id && loan.borrower) {
          uniqueContacts.set(loan.borrower.id, {
            id: loan.borrower.id,
            name: loan.borrower.name
          });
        }
      });
      
      setContacts(Array.from(uniqueContacts.values()));
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };
  
  // Send a message
  const sendMessage = async (subject: string, content: string, recipientId: string, replyToId?: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          subject,
          content,
          created_at: new Date().toISOString(),
          read: false,
          reply_to: replyToId
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
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
        
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
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
        
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
