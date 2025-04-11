
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PenSquare, Inbox, Send, Bell } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageList, { Message } from '@/components/messaging/MessageList';
import MessageDetail from '@/components/messaging/MessageDetail';
import ComposeMessage from '@/components/messaging/ComposeMessage';
import { useToast } from '@/hooks/use-toast';

const Messages = () => {
  const { isAuthenticated, user } = useAuth();
  const { 
    inboxMessages, 
    sentMessages, 
    contacts,
    loading, 
    sendMessage, 
    markAsRead, 
    deleteMessage,
    refreshMessages
  } = useMessages();
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  
  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
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
    setIsComposing(true);
  };
  
  const handleReply = (message: Message) => {
    setIsReplying(true);
    setIsComposing(true);
  };
  
  const handleCancelCompose = () => {
    setIsComposing(false);
    setIsReplying(false);
  };
  
  const handleSendMessage = async (subject: string, content: string, recipientId: string, replyToId?: string) => {
    const success = await sendMessage(subject, content, recipientId, replyToId);
    
    if (success) {
      setIsComposing(false);
      setIsReplying(false);
      setSelectedTab('sent');
      return true;
    }
    
    return false;
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    const success = await deleteMessage(messageId);
    
    if (success) {
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully",
      });
      setSelectedMessage(null);
    } else {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };
  
  const handleBack = () => {
    setSelectedMessage(null);
  };
  
  const currentMessages = selectedTab === 'inbox' ? inboxMessages : sentMessages;
  const unreadCount = inboxMessages.filter(msg => !msg.read).length;
  
  // For debugging
  console.log('User role:', user?.user_metadata?.role);
  console.log('Available contacts:', contacts);
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center">
              Messages
              {unreadCount > 0 && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                  {unreadCount} new
                </span>
              )}
            </h1>
            
            <Button onClick={handleComposeNew}>
              <PenSquare className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden">
                <Tabs defaultValue="inbox" value={selectedTab} onValueChange={setSelectedTab}>
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
                  
                  <TabsContent value="inbox" className="m-0 max-h-[600px] overflow-y-auto">
                    <MessageList 
                      messages={inboxMessages} 
                      onMessageSelect={handleMessageSelect}
                      selectedMessageId={selectedMessage?.id}
                    />
                  </TabsContent>
                  
                  <TabsContent value="sent" className="m-0 max-h-[600px] overflow-y-auto">
                    <MessageList 
                      messages={sentMessages} 
                      onMessageSelect={handleMessageSelect}
                      selectedMessageId={selectedMessage?.id}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden min-h-[600px]">
                {isComposing ? (
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
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No message selected</h3>
                      <p className="text-gray-500 max-w-sm mt-2">
                        Select a message from the list to view its contents or compose a new message.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleComposeNew}
                      >
                        <PenSquare className="h-4 w-4 mr-2" />
                        Compose New Message
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
