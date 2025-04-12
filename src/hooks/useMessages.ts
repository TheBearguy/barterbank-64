
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/components/messaging/MessageList';
import { useContacts } from '@/hooks/useContacts';
import { 
  fetchInboxMessages,
  fetchSentMessages,
  sendMessageToUser,
  markMessageAsRead,
  deleteUserMessage
} from '@/utils/messageUtils';

export function useMessages() {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        
        // Load inbox messages
        const inbox = await fetchInboxMessages(user.id);
        setInboxMessages(inbox);
        
        // Load sent messages
        const sent = await fetchSentMessages(user.id);
        setSentMessages(sent);
        
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [user, refreshTrigger]);
  
  // Send a message
  const sendMessage = async (subject: string, content: string, recipientId: string, replyToId?: string) => {
    if (!user) return false;
    
    const success = await sendMessageToUser(user.id, recipientId, subject, content, replyToId);
    if (success) {
      refreshMessages();
    }
    return success;
  };
  
  // Mark a message as read
  const markAsRead = async (messageId: string) => {
    const success = await markMessageAsRead(messageId);
    
    if (success) {
      // Update local state
      setInboxMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    }
    
    return success;
  };
  
  // Delete a message
  const deleteMessage = async (messageId: string) => {
    const success = await deleteUserMessage(messageId);
    
    if (success) {
      // Update local state
      setInboxMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      setSentMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    }
    
    return success;
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
