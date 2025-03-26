
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LoanRequestProps {
  id: string;
  amount: number;
  status: string;
  requestDate: string;
  offersCount: number;
  onViewDetails: (id: string) => void;
}

const LoanRequestCard = ({ 
  id, 
  amount, 
  status, 
  requestDate, 
  offersCount, 
  onViewDetails 
}: LoanRequestProps) => {
  return (
    <Card className="hover:shadow-elevation transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>₹{amount}</CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {status}
          </div>
        </div>
        <CardDescription className="mt-2">Requested on {requestDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            {offersCount} Offers received
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onViewDetails(id)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanRequestCard;
