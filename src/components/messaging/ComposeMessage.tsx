
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Message } from './MessageList';
import { useAuth } from '@/context/AuthContext';
import RecipientSelector from './RecipientSelector';

interface Recipient {
  id: string;
  name: string;
}

interface ComposeMessageProps {
  recipients: Recipient[];
  onSend: (subject: string, content: string, recipientId: string, replyToId?: string) => Promise<boolean>;
  onCancel: () => void;
  replyTo?: Message;
}

const ComposeMessage = ({ recipients, onSend, onCancel, replyTo }: ComposeMessageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [recipientId, setRecipientId] = useState<string>(replyTo ? replyTo.sender_id : '');
  const [subject, setSubject] = useState<string>(replyTo ? `Re: ${replyTo.subject}` : '');
  const [content, setContent] = useState<string>(replyTo ? `\n\n--------\nOn ${new Date(replyTo.created_at).toLocaleString()}, ${replyTo.sender_name} wrote:\n${replyTo.content}` : '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Log available recipients for debugging
    console.log("Available recipients:", recipients);
    
    if (replyTo) {
      setRecipientId(replyTo.sender_id);
      setSubject(`Re: ${replyTo.subject}`);
      setContent(`\n\n--------\nOn ${new Date(replyTo.created_at).toLocaleString()}, ${replyTo.sender_name} wrote:\n${replyTo.content}`);
    }
  }, [replyTo, recipients]);

  const handleSend = async () => {
    if (!recipientId) {
      toast({
        title: "Error",
        description: "Please select a recipient",
        variant: "destructive"
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      console.log("Sending message to recipient:", recipientId);
      const success = await onSend(subject, content, recipientId, replyTo?.id);
      if (success) {
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
        onCancel();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectRecipient = (id: string) => {
    console.log("Selected recipient ID:", id);
    setRecipientId(id);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-950 rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">
          {replyTo ? "Reply" : "New Message"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="recipient">To</Label>
          <RecipientSelector 
            recipients={recipients}
            selectedRecipientId={recipientId}
            onSelectRecipient={handleSelectRecipient}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isReplyMode={!!replyTo}
            replyToName={replyTo?.sender_name}
          />
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input 
            id="subject" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Enter subject"
          />
        </div>

        <div>
          <Label htmlFor="content">Message</Label>
          <Textarea 
            id="content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder="Type your message here"
            rows={8}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComposeMessage;
