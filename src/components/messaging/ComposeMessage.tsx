
import React, { useState, useEffect } from 'react';
import { X, UserRound, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Message } from './MessageList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';

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

  // Get user role
  const userRole = user?.user_metadata?.role || '';

  useEffect(() => {
    if (replyTo) {
      setRecipientId(replyTo.sender_id);
      setSubject(`Re: ${replyTo.subject}`);
      setContent(`\n\n--------\nOn ${new Date(replyTo.created_at).toLocaleString()}, ${replyTo.sender_name} wrote:\n${replyTo.content}`);
    }
  }, [replyTo]);

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
      const success = await onSend(subject, content, recipientId, replyTo?.id);
      if (success) {
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
        onCancel();
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

  // Filter recipients based on search term
  const filteredRecipients = searchTerm
    ? recipients.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : recipients;

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
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipients..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {!replyTo && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {filteredRecipients.length > 0 ? (
                  <ul className="divide-y">
                    {filteredRecipients.map((recipient) => (
                      <li 
                        key={recipient.id}
                        className={`p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 ${
                          recipientId === recipient.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                        }`}
                        onClick={() => setRecipientId(recipient.id)}
                      >
                        <UserRound className="h-4 w-4 text-gray-400" />
                        <span>{recipient.name}</span>
                        {recipientId === recipient.id && (
                          <span className="ml-auto text-xs bg-primary text-white px-1.5 py-0.5 rounded">
                            Selected
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No matching recipients found' : 'No recipients available'}
                  </div>
                )}
              </div>
            )}
            
            {replyTo && (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                <UserRound className="h-4 w-4 text-gray-400" />
                <span>{replyTo.sender_name}</span>
              </div>
            )}
          </div>
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
