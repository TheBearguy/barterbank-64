import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Message,
  Contact,
  fetchMessages,
  fetchAvailableContacts,
  sendMessage as sendMessageUtil,
  markMessageAsRead as markMessageAsReadUtil,
  deleteMessage as deleteMessageUtil
} from '@/utils/messageUtils';

export function useMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMessages = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    
    try {
      setIsRefreshing(true);
      setError(null);
      
      const [fetchedMessages, fetchedContacts] = await Promise.all([
        fetchMessages(),
        fetchAvailableContacts(user.id)
      ]);
      
      setMessages(fetchedMessages);
      setContacts(fetchedContacts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching messages:', errorMessage);
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshMessages();
    }
  }, [user]);

  const sendMessage = async (subject: string, content: string, recipientId: string, replyToId?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      await sendMessageUtil(user.id, recipientId, subject, content, replyToId);
      await refreshMessages();
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error sending message:', errorMessage);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await markMessageAsReadUtil(messageId);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error marking message as read:', errorMessage);
      toast({
        title: "Error",
        description: "Failed to mark message as read.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await deleteMessageUtil(messageId);
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error deleting message:', errorMessage);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const inboxMessages = messages.filter(msg => msg.recipient_id === user?.id);
  const sentMessages = messages.filter(msg => msg.sender_id === user?.id);

  return {
    inboxMessages,
    sentMessages,
    contacts,
    loading,
    error,
    isRefreshing,
    sendMessage,
    markAsRead,
    deleteMessage,
    refreshMessages
  };
}
