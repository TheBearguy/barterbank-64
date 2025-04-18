import React from 'react';
import { Mail, MailOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  recipient_name?: string; // Add optional recipient_name property
  subject: string;
  content: string;
  created_at: string;
  read: boolean;
  reply_to?: string;
  sender_avatar?: string;
  recipient_avatar?: string;
}

interface MessageListProps {
  messages: Message[];
  onMessageSelect: (message: Message) => void;
  selectedMessageId?: string;
  isLoading?: boolean;
}

const MessageList = ({ 
  messages, 
  onMessageSelect, 
  selectedMessageId,
  isLoading = false 
}: MessageListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
            selectedMessageId === message.id && "bg-gray-50 dark:bg-gray-800",
            !message.read && "font-medium"
          )}
          onClick={() => onMessageSelect(message)}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {message.read ? (
                <MailOpen className="h-5 w-5 text-gray-400" />
              ) : (
                <Mail className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className={cn("text-sm", !message.read && "font-medium")}>
                  {message.sender_name}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </div>
              <h4 className={cn("text-sm truncate mb-1", !message.read && "font-medium")}>
                {message.subject}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2">
                {message.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
