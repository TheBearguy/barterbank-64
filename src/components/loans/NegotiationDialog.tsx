
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { IndianRupee, MessageSquare, Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Card,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  sender: 'lender' | 'borrower';
  text: string;
  timestamp: string;
  offerAmount?: number;
  services?: string[];
}

interface NegotiationDialogProps {
  loan: any;
  isOpen: boolean;
  onClose: () => void;
}

const NegotiationDialog: React.FC<NegotiationDialogProps> = ({ 
  loan, 
  isOpen, 
  onClose 
}) => {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState<string>('');
  const [newOfferAmount, setNewOfferAmount] = useState<string>(loan.amount.toString());
  const [activeTab, setActiveTab] = useState<string>('message');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Mock message history - in a real app, this would come from an API
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'lender',
      text: 'I\'m interested in funding your loan. Would you consider accepting a partial amount now?',
      timestamp: '2023-11-12 10:30 AM',
    },
    {
      id: '2',
      sender: 'borrower',
      text: 'Thank you for your interest. What amount are you proposing?',
      timestamp: '2023-11-12 11:15 AM',
    },
    {
      id: '3',
      sender: 'lender',
      text: 'I can offer ₹3,500 now, and if things go well, potentially the remaining amount later.',
      timestamp: '2023-11-12 12:45 PM',
      offerAmount: 3500,
    },
    {
      id: '4',
      sender: 'borrower',
      text: 'I need at least ₹4,000 to cover my immediate expenses. Can you increase your offer?',
      timestamp: '2023-11-13 09:30 AM',
      offerAmount: 4000,
    }
  ]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && activeTab === 'message') {
      toast({
        title: "Empty message",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'offer' && (!newOfferAmount || parseFloat(newOfferAmount) <= 0)) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Create new message
    const newMessageObj: Message = {
      id: (messages.length + 1).toString(),
      sender: 'lender', // Assuming the current user is a lender
      text: activeTab === 'message' ? newMessage : `I'd like to offer ₹${newOfferAmount} for your loan.`,
      timestamp: new Date().toLocaleString(),
      ...(activeTab === 'offer' && { offerAmount: parseFloat(newOfferAmount) })
    };

    // Simulate API call
    setTimeout(() => {
      setMessages([...messages, newMessageObj]);
      setNewMessage('');
      setIsSubmitting(false);
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the borrower",
      });
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Negotiation with {loan.borrower.name}</DialogTitle>
          <DialogDescription>
            Discuss loan terms and make counter offers
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto mb-4 flex-1 pr-2">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 flex ${message.sender === 'lender' ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[85%] ${message.sender === 'lender' ? 'bg-primary/10' : 'bg-gray-100'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center mb-1">
                      {message.sender === 'borrower' ? (
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2 text-xs">
                          B
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white mr-2 text-xs">
                          L
                        </div>
                      )}
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    
                    <p className="text-sm">{message.text}</p>
                    
                    {message.offerAmount && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium flex items-center">
                          Offer Amount: <IndianRupee className="h-3 w-3 mx-1" />
                          {message.offerAmount}
                        </p>
                      </div>
                    )}
                    
                    {message.services && message.services.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Services:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {message.services.map((service, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-3">
            <Tabs defaultValue="message" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="message">Message</TabsTrigger>
                <TabsTrigger value="offer">Make Offer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="message" className="mt-2">
                <Textarea 
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </TabsContent>
              
              <TabsContent value="offer" className="mt-2 space-y-3">
                <div className="space-y-2">
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      type="number"
                      className="pl-10"
                      placeholder="Offer amount"
                      value={newOfferAmount}
                      onChange={(e) => setNewOfferAmount(e.target.value)}
                    />
                  </div>
                  <Textarea 
                    placeholder="Add details about your offer..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <DialogFooter className="border-t pt-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NegotiationDialog;
