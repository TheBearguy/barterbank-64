
import React from 'react';
import { Bell, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageEmptyStateProps {
  onCompose: () => void;
}

const MessageEmptyState = ({ onCompose }: MessageEmptyStateProps) => {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center">
        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
          No message selected
        </h3>
        <p className="text-gray-500 max-w-sm mt-2">
          Select a message from the list to view its contents or compose a new message.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onCompose}
        >
          <PenSquare className="h-4 w-4 mr-2" />
          Compose New Message
        </Button>
      </div>
    </div>
  );
};

export default MessageEmptyState;
