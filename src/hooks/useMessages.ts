
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
import { supabase } from '@/integrations/supabase/client';

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
        
        // Try to load inbox messages with Edge Function
        try {
          const inbox = await fetchInboxMessages(user.id);
          setInboxMessages(inbox);
        } catch (inboxError) {
          console.error('Error fetching inbox messages from Edge Function:', inboxError);
          
          // Fallback: Direct query for inbox messages
          try {
            console.log("Using fallback direct query for inbox messages");
            const { data: inboxData, error: inboxQueryError } = await supabase
              .from('messages')
              .select(`
                id, 
                sender_id,
                sender:profiles!sender_id(name),
                recipient_id,
                subject,
                content,
                created_at,
                read,
                reply_to
              `)
              .eq('recipient_id', user.id)
              .order('created_at', { ascending: false });
              
            if (inboxQueryError) {
              console.error("Inbox direct query error:", inboxQueryError);
              throw inboxQueryError;
            }
            
            if (inboxData && inboxData.length > 0) {
              console.log(`Found ${inboxData.length} inbox messages via direct query`);
              
              // Format the data
              const formattedInbox = inboxData.map(message => ({
                id: message.id,
                sender_id: message.sender_id,
                sender_name: message.sender?.name || "Unknown User",
                recipient_id: message.recipient_id,
                subject: message.subject,
                content: message.content,
                created_at: message.created_at,
                read: message.read,
                reply_to: message.reply_to
              }));
              
              setInboxMessages(formattedInbox);
            } else {
              console.log("No inbox messages found via direct query");
              setInboxMessages([]);
            }
          } catch (fallbackError) {
            console.error("Both inbox methods failed:", fallbackError);
            setInboxMessages([]);
          }
        }
        
        // Try to load sent messages with Edge Function
        try {
          const sent = await fetchSentMessages(user.id);
          setSentMessages(sent);
        } catch (sentError) {
          console.error('Error fetching sent messages from Edge Function:', sentError);
          
          // Fallback: Direct query for sent messages
          try {
            console.log("Using fallback direct query for sent messages");
            const { data: sentData, error: sentQueryError } = await supabase
              .from('messages')
              .select(`
                id, 
                sender_id,
                recipient_id,
                recipient:profiles!recipient_id(name),
                subject,
                content,
                created_at,
                read,
                reply_to
              `)
              .eq('sender_id', user.id)
              .order('created_at', { ascending: false });
              
            if (sentQueryError) {
              console.error("Sent direct query error:", sentQueryError);
              throw sentQueryError;
            }
            
            if (sentData && sentData.length > 0) {
              console.log(`Found ${sentData.length} sent messages via direct query`);
              
              // Format the data
              const formattedSent = sentData.map(message => ({
                id: message.id,
                sender_id: message.sender_id,
                sender_name: 'You',
                recipient_id: message.recipient_id,
                recipient_name: message.recipient?.name || "Unknown User",
                subject: message.subject,
                content: message.content,
                created_at: message.created_at,
                read: message.read,
                reply_to: message.reply_to
              }));
              
              setSentMessages(formattedSent);
            } else {
              console.log("No sent messages found via direct query");
              setSentMessages([]);
            }
          } catch (fallbackError) {
            console.error("Both sent methods failed:", fallbackError);
            setSentMessages([]);
          }
        }
        
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
      console.log("Attempting to send message to:", recipientId, "from:", user.id);
      
      if (!subject || !content || !recipientId) {
        console.error("Missing required parameters");
        throw new Error("Missing required message parameters");
      }
      
      // Try Edge Function first
      try {
        const success = await sendMessageToUser(user.id, recipientId, subject, content, replyToId);
        
        if (success) {
          console.log("Message sent successfully via Edge Function");
          refreshMessages();
          return true;
        } else {
          console.error("sendMessageToUser returned false");
          throw new Error("Failed to send message via Edge Function");
        }
      } catch (edgeFunctionError) {
        console.error("Error sending message via Edge Function:", edgeFunctionError);
        
        // Fallback: Direct insert
        try {
          console.log("Using fallback direct insert for sending message");
          const { error: insertError } = await supabase
            .from('messages')
            .insert({
              sender_id: user.id,
              recipient_id: recipientId,
              subject,
              content,
              created_at: new Date().toISOString(),
              read: false,
              reply_to: replyToId || null
            });
            
          if (insertError) {
            console.error("Direct insert error:", insertError);
            throw insertError;
          }
          
          console.log("Message sent successfully via direct insert");
          refreshMessages();
          return true;
        } catch (fallbackError) {
          console.error("Both message sending methods failed:", fallbackError);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error; // Let the calling component handle the error
    }
  };
  
  // Mark a message as read
  const markAsRead = async (messageId: string) => {
    try {
      // Try Edge Function first
      try {
        const success = await markMessageAsRead(messageId);
        
        if (success) {
          console.log("Message marked as read via Edge Function");
          // Update local state
          setInboxMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId ? { ...msg, read: true } : msg
            )
          );
          return true;
        } else {
          throw new Error("Failed to mark message as read via Edge Function");
        }
      } catch (edgeFunctionError) {
        console.error("Error marking message as read via Edge Function:", edgeFunctionError);
        
        // Fallback: Direct update
        try {
          console.log("Using fallback direct update for marking message as read");
          const { error: updateError } = await supabase
            .from('messages')
            .update({ read: true })
            .eq('id', messageId)
            .eq('recipient_id', user?.id);
            
          if (updateError) {
            console.error("Direct update error:", updateError);
            throw updateError;
          }
          
          console.log("Message marked as read via direct update");
          // Update local state
          setInboxMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId ? { ...msg, read: true } : msg
            )
          );
          return true;
        } catch (fallbackError) {
          console.error("Both mark as read methods failed:", fallbackError);
          throw fallbackError;
        }
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
      // Try Edge Function first
      try {
        const success = await deleteUserMessage(messageId);
        
        if (success) {
          console.log("Message deleted via Edge Function");
          // Update local state
          setInboxMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
          setSentMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
          
          toast({
            title: "Success",
            description: "Message deleted successfully",
          });
          
          return true;
        } else {
          throw new Error("Failed to delete message via Edge Function");
        }
      } catch (edgeFunctionError) {
        console.error("Error deleting message via Edge Function:", edgeFunctionError);
        
        // Fallback: Direct delete
        try {
          console.log("Using fallback direct delete for message");
          const { error: deleteError } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageId)
            .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`);
            
          if (deleteError) {
            console.error("Direct delete error:", deleteError);
            throw deleteError;
          }
          
          console.log("Message deleted via direct delete");
          // Update local state
          setInboxMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
          setSentMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
          
          toast({
            title: "Success",
            description: "Message deleted successfully",
          });
          
          return true;
        } catch (fallbackError) {
          console.error("Both delete methods failed:", fallbackError);
          throw fallbackError;
        }
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
