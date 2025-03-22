
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
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userToRate: {
    name: string;
    role: 'lender' | 'borrower';
  };
}

const RatingDialog: React.FC<RatingDialogProps> = ({ 
  isOpen, 
  onClose,
  userToRate
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleSubmitRating = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Rating Submitted",
        description: `You've rated ${userToRate.name} with ${rating} stars.`,
      });
      onClose();
    }, 1000);
  };

  const renderStars = () => {
    return (
      <div className="flex justify-center space-x-2 my-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 ${
                (hoveredRating !== null ? star <= hoveredRating : star <= rating)
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How was your experience with {userToRate.name}? Your feedback helps build trust in our community.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="text-center">
            <p className="mb-2 font-medium">
              Rate the {userToRate.role === 'lender' ? 'lender' : 'borrower'}
            </p>
            {renderStars()}
            <p className="text-sm text-gray-500">
              {rating === 1 && "Poor - Needs significant improvement"}
              {rating === 2 && "Fair - Below average experience"}
              {rating === 3 && "Good - Average experience"}
              {rating === 4 && "Very Good - Above average experience"}
              {rating === 5 && "Excellent - Outstanding experience"}
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="feedback" className="block text-sm font-medium">
              Additional Feedback (Optional)
            </label>
            <Textarea 
              id="feedback"
              placeholder="Share your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
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
            onClick={handleSubmitRating}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Submitting...
              </>
            ) : (
              <>Submit Rating</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
