
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OfferCardProps {
  id: string;
  amount: number;
  status: string;
  offerDate: string;
  loanId: string;
  onViewDetails: (id: string) => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

const OfferCard = ({ 
  id, 
  amount, 
  status, 
  offerDate, 
  loanId, 
  onViewDetails,
  onAccept,
  onDecline 
}: OfferCardProps) => {
  return (
    <Card className="hover:shadow-elevation transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>₹{amount}</CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {status}
          </div>
        </div>
        <CardDescription className="mt-2">Offered on {offerDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            For Loan Request #{loanId}
          </span>
          <div className="space-x-2">
            {status === 'pending' && onAccept && onDecline && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDecline(id)}
                >
                  Decline
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onAccept(id)}
                >
                  Accept
                </Button>
              </>
            )}
            {status === 'accepted' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewDetails(loanId)}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfferCard;
