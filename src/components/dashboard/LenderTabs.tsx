
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OfferCard from './OfferCard';
import LoanRequestCard from './LoanRequestCard';
import { useNavigate } from 'react-router-dom';

interface Loan {
  id: string;
  amount: number;
  status: string;
  requestDate: string;
  offersCount: number;
}

interface Offer {
  id: string;
  amount: number;
  status: string;
  offerDate: string;
  loanId: string;
}

interface LenderTabsProps {
  offers: Offer[];
  availableLoans: Loan[];
  onViewLoanDetails: (id: string) => void;
}

const LenderTabs = ({ offers, availableLoans, onViewLoanDetails }: LenderTabsProps) => {
  const navigate = useNavigate();

  return (
    <Tabs defaultValue="offers" className="w-full">
      <TabsList className="grid grid-cols-2 mb-8">
        <TabsTrigger value="offers">My Offers</TabsTrigger>
        <TabsTrigger value="browse">Browse Requests</TabsTrigger>
      </TabsList>
      
      <TabsContent value="offers" className="space-y-6">
        <h3 className="text-xl font-semibold mb-6">Your Active Offers</h3>
        
        {offers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {offers.map(offer => (
              <OfferCard
                key={offer.id}
                id={offer.id}
                amount={offer.amount}
                status={offer.status}
                offerDate={offer.offerDate}
                loanId={offer.loanId}
                onViewDetails={onViewLoanDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't made any offers yet</p>
            <Button onClick={() => navigate('/loans')}>Browse Loan Requests</Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="browse" className="space-y-6">
        <h3 className="text-xl font-semibold mb-6">Available Loan Requests</h3>
        
        {availableLoans.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {availableLoans.map(loan => (
              <Card key={loan.id} className="hover:shadow-elevation transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>₹{loan.amount}</CardTitle>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {loan.status}
                    </div>
                  </div>
                  <CardDescription>Requested on {loan.requestDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {loan.offersCount} Offers received
                    </span>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewLoanDetails(loan.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => onViewLoanDetails(loan.id)}
                      >
                        Make Offer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No loan requests available at the moment</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default LenderTabs;
