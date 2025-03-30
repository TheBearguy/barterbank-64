
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OfferCard from './OfferCard';
import { useNavigate } from 'react-router-dom';

interface LenderTabsProps {
  offers: any[];
  availableLoans: any[];
  onViewLoanDetails: (id: string) => void;
  onViewRepayment?: (id: string) => void;
  onAcceptOffer?: (id: string, note?: string) => void;
  onDeclineOffer?: (id: string, note?: string) => void;
  onCounterOffer?: (id: string, amount: number, note: string) => void;
}

const LenderTabs = ({ 
  offers, 
  availableLoans, 
  onViewLoanDetails, 
  onViewRepayment,
  onAcceptOffer,
  onDeclineOffer,
  onCounterOffer
}: LenderTabsProps) => {
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
                amount={parseFloat(offer.amount.toString())}
                status={offer.status}
                offerDate={new Date(offer.created_at).toLocaleDateString()}
                loanId={offer.loan_id}
                message={offer.message}
                borrowerNote={offer.borrower_note}
                repaymentStatus={offer.repayment_status}
                borrowerRepaymentProposal={offer.borrower_repayment_proposal}
                lenderRepaymentProposal={offer.lender_repayment_proposal}
                lenderName={offer.borrower?.name ? `To ${offer.borrower.name}` : undefined}
                onViewDetails={onViewLoanDetails}
                onViewRepayment={onViewRepayment}
                onAccept={onAcceptOffer}
                onDecline={onDeclineOffer}
                onCounter={onCounterOffer}
                isLender={true}
                paymentCompleted={offer.status === 'accepted' && offer.repayment_status !== 'pending'}
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
                  <CardDescription>Requested on {new Date(loan.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      From {loan.borrower?.name || 'Unknown'}
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
