
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import MessageTabs from '@/components/messaging/MessageTabs';

const Messages = () => {
  const { isAuthenticated, user } = useAuth();
  const { inboxMessages, loading } = useMessages();
  const [selectedTab, setSelectedTab] = useState('inbox');
  
  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const unreadCount = inboxMessages.filter(msg => !msg.read).length;
  
  // For debugging
  console.log('User role:', user?.user_metadata?.role);
  
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
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
