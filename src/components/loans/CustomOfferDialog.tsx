
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IndianRupee, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomOfferDialogProps {
  loan: any;
  isOpen: boolean;
  onClose: () => void;
  onOfferSubmit: () => void;
}

const CustomOfferDialog: React.FC<CustomOfferDialogProps> = ({ 
  loan, 
  isOpen, 
  onClose, 
  onOfferSubmit 
}) => {
  const { toast } = useToast();
  const [offerAmount, setOfferAmount] = useState<string>(loan.amount.toString());
  const [message, setMessage] = useState<string>('');
  const [services, setServices] = useState<string[]>([...loan.services]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customService, setCustomService] = useState<string>('');

  const handleSubmitOffer = () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onOfferSubmit();
      toast({
        title: "Offer submitted!",
        description: "Your offer has been sent to the borrower.",
      });
    }, 1000);
  };

  const handleAddService = () => {
    if (customService.trim() && !services.includes(customService.trim())) {
      setServices([...services, customService.trim()]);
      setCustomService('');
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter(service => service !== serviceToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Custom Offer</DialogTitle>
          <DialogDescription>
            Customize your offer for {loan.borrower.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Offer Amount</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="amount"
                type="number"
                className="pl-10"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message to Borrower</Label>
            <Textarea 
              id="message"
              placeholder="Write a message to the borrower..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Accepted Services</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  <span>{service}</span>
                  <button
                    type="button"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    onClick={() => handleRemoveService(service)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a service..."
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddService}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitOffer}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Submitting...
              </>
            ) : (
              <>Submit Offer</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomOfferDialog;
