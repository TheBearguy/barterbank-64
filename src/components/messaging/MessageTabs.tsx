
import React, { useState, useEffect } from 'react';
import { Inbox, Send, PenSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMessages } from '@/hooks/useMessages';
import { Message } from '@/components/messaging/MessageList';
import MessageList from '@/components/messaging/MessageList';
import MessageDetail from '@/components/messaging/MessageDetail';
import ComposeMessage from '@/components/messaging/ComposeMessage';
import MessageEmptyState from '@/components/messaging/MessageEmptyState';
import { useToast } from '@/hooks/use-toast';

interface MessageTabsProps {
  selectedTab: string;
  unreadCount: number;
  onTabChange: (tab: string) => void;
  isComposing?: boolean;
  setIsComposing?: (isComposing: boolean) => void;
}

const MessageTabs = ({ 
  selectedTab, 
  unreadCount, 
  onTabChange, 
  isComposing = false,
  setIsComposing = () => {}
}: MessageTabsProps) => {
  const { 
    inboxMessages, 
    sentMessages, 
    contacts,
    sendMessage, 
    markAsRead, 
    deleteMessage 
  } = useMessages();
  const { toast } = useToast();
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [localIsComposing, setLocalIsComposing] = useState(isComposing);
  const [isReplying, setIsReplying] = useState(false);
  
  // Sync with parent component's state
  useEffect(() => {
    setLocalIsComposing(isComposing);
  }, [isComposing]);
  
  // Notify parent component when state changes
  useEffect(() => {
    setIsComposing(localIsComposing);
  }, [localIsComposing, setIsComposing]);
  
  const handleMessageSelect = async (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if it's in the inbox and unread
    if (selectedTab === 'inbox' && !message.read) {
      await markAsRead(message.id);
    }
  };
  
  const handleComposeNew = () => {
    setSelectedMessage(null);
    setIsReplying(false);
    setLocalIsComposing(true);
  };
  
  const handleReply = (message: Message) => {
    setIsReplying(true);
    setLocalIsComposing(true);
  };
  
  const handleCancelCompose = () => {
    setLocalIsComposing(false);
    setIsReplying(false);
  };
  
  const handleSendMessage = async (subject: string, content: string, recipientId: string, replyToId?: string) => {
    try {
      const success = await sendMessage(subject, content, recipientId, replyToId);
      
      if (success) {
        setLocalIsComposing(false);
        setIsReplying(false);
        onTabChange('sent'); // Switch to sent tab after sending
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    const success = await deleteMessage(messageId);
    
    if (success) {
      setSelectedMessage(null);
    }
  };
  
  const handleBack = () => {
    setSelectedMessage(null);
  };
  
  const currentMessages = selectedTab === 'inbox' ? inboxMessages : sentMessages;
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="inbox" value={selectedTab} onValueChange={onTabChange}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Sent</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <MessageList 
              messages={currentMessages} 
              onMessageSelect={handleMessageSelect}
              selectedMessageId={selectedMessage?.id}
            />
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden min-h-[600px]">
          {localIsComposing ? (
            <ComposeMessage 
              recipients={contacts} 
              onSend={handleSendMessage}
              onCancel={handleCancelCompose}
              replyTo={isReplying ? selectedMessage : undefined}
            />
          ) : selectedMessage ? (
            <MessageDetail 
              message={selectedMessage}
              onBack={handleBack}
              onReply={handleReply}
              onDelete={handleDeleteMessage}
            />
          ) : (
            <MessageEmptyState onCompose={handleComposeNew} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageTabs;
