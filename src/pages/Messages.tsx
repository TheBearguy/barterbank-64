
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import MessageTabs from '@/components/messaging/MessageTabs';
import { useToast } from '@/hooks/use-toast';

const Messages = () => {
  const { isAuthenticated, user } = useAuth();
  const { inboxMessages, loading, refreshMessages } = useMessages();
  const [selectedTab, setSelectedTab] = useState('inbox');
  const { toast } = useToast();
  const [isComposing, setIsComposing] = useState(false);
  
  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const unreadCount = inboxMessages.filter(msg => !msg.read).length;
  
  const handleComposeNew = () => {
    setIsComposing(true);
  };
  
  const handleRefresh = () => {
    refreshMessages();
    toast({
      title: "Refreshed",
      description: "Messages have been refreshed",
    });
  };
  
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
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                className="flex items-center gap-2"
              >
                Refresh
              </Button>
              <Button onClick={handleComposeNew} className="flex items-center gap-2">
                <PenSquare className="h-4 w-4" />
                New Message
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : (
            <MessageTabs 
              selectedTab={selectedTab} 
              unreadCount={unreadCount} 
              onTabChange={setSelectedTab} 
              isComposing={isComposing}
              setIsComposing={setIsComposing}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
