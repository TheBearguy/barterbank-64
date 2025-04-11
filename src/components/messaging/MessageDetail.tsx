
import React from 'react';
import { ArrowLeft, Reply, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from './MessageList';

interface MessageDetailProps {
  message: Message;
  onBack: () => void;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
}

const MessageDetail = ({ message, onBack, onReply, onDelete }: MessageDetailProps) => {
  return (
    <div className="p-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" size="sm" onClick={() => onReply(message)}>
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(message.id)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Message header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">{message.subject}</h2>
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>From: {message.sender_name}</span>
          <span>{new Date(message.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Message content */}
      <div className="prose max-w-none dark:prose-invert">
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export default MessageDetail;
