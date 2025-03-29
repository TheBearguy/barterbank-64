
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OfferCardProps {
  id: string;
  amount: number;
  status: string;
  offerDate: string;
  loanId: string;
  lenderName?: string;
  message?: string;
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
  lenderName,
  message,
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
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            status === 'accepted' ? 'bg-green-100 text-green-800' :
            status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {status}
          </div>
        </div>
        <CardDescription className="mt-2">
          {lenderName && <span className="font-medium">From {lenderName}</span>}
          <span className="ml-2">Offered on {offerDate}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md text-gray-700 text-sm">
            <p className="italic">{message}</p>
          </div>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            For Loan Request #{loanId.substring(0, 8)}
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
