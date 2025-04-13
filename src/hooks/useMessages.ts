
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/components/messaging/MessageList';
import { useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
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
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [user, refreshTrigger, toast]);
  
  // Send a message
  const sendMessage = async (subject: string, content: string, recipientId: string, replyToId?: string) => {
    if (!user) return false;
    
    try {
      console.log("Attempting to send message to:", recipientId);
      const success = await sendMessageToUser(user.id, recipientId, subject, content, replyToId);
      
      if (success) {
        console.log("Message sent successfully");
        refreshMessages();
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
        return true;
      } else {
        console.error("sendMessageToUser returned false");
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Mark a message as read
  const markAsRead = async (messageId: string) => {
    try {
      const success = await markMessageAsRead(messageId);
      
      if (success) {
        // Update local state
        setInboxMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, read: true } : msg
          )
        );
        return true;
      } else {
        throw new Error("Failed to mark message as read");
      }
    } catch (error) {
      console.error("Error in markAsRead:", error);
      toast({
        title: "Error",
        description: "Failed to mark message as read.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Delete a message
  const deleteMessage = async (messageId: string) => {
    try {
      const success = await deleteUserMessage(messageId);
      
      if (success) {
        // Update local state
        setInboxMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        setSentMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        
        toast({
          title: "Success",
          description: "Message deleted successfully",
        });
        
        return true;
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error in deleteMessage:", error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive"
      });
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
