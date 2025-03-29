
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
import { IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomOfferDialogProps {
  loan: any;
  isOpen: boolean;
  onClose: () => void;
  onOfferSubmit: (amount: number, message: string) => void;
  previousOffers?: {
    amount: number;
    message: string;
  }[];
}

const CustomOfferDialog: React.FC<CustomOfferDialogProps> = ({ 
  loan, 
  isOpen, 
  onClose, 
  onOfferSubmit,
  previousOffers = []
}) => {
  const { toast } = useToast();
  const [offerAmount, setOfferAmount] = useState<string>(loan.amount?.toString() || "0");
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // If there are previous offers, initialize with the latest one
  React.useEffect(() => {
    if (previousOffers.length > 0) {
      const latestOffer = previousOffers[previousOffers.length - 1];
      setOfferAmount(latestOffer.amount.toString());
      setMessage(latestOffer.message);
    }
  }, [previousOffers]);

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
    
    try {
      onOfferSubmit(parseFloat(offerAmount), message);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "There was an error submitting your offer",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Custom Offer</DialogTitle>
          <DialogDescription>
            Customize your offer for {loan.borrower?.name || "the borrower"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {previousOffers.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
              <p className="font-medium mb-1">Previously Submitted Offer</p>
              <p><span className="font-medium">Amount:</span> ₹{previousOffers[previousOffers.length - 1].amount}</p>
              {previousOffers[previousOffers.length - 1].message && (
                <p className="mt-1"><span className="font-medium">Message:</span> {previousOffers[previousOffers.length - 1].message}</p>
              )}
            </div>
          )}
          
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
