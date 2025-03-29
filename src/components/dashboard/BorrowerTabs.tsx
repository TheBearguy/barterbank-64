
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import LoanRequestCard from './LoanRequestCard';
import OfferCard from './OfferCard';
import ServiceCard from './ServiceCard';
import { useToast } from '@/hooks/use-toast';
import { useLoansData } from '@/hooks/useLoansData';

interface Loan {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  description: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  value: number;
}

interface BorrowerTabsProps {
  services: Service[];
  onCreateLoan: () => void;
  onViewLoanDetails: (id: string) => void;
}

const BorrowerTabs = ({
  services,
  onCreateLoan,
  onViewLoanDetails
}: BorrowerTabsProps) => {
  const { toast } = useToast();
  const { userLoans, receivedOffers, loading, updateOfferStatus } = useLoansData();
  
  const handleAcceptOffer = async (offerId: string) => {
    const success = await updateOfferStatus(offerId, 'accepted');
    if (success) {
      toast({
        title: "Offer Accepted",
        description: "You have accepted the offer. Lender has been notified.",
      });
      // Refresh the page to update data
      window.location.reload();
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    const success = await updateOfferStatus(offerId, 'rejected');
    if (success) {
      toast({
        title: "Offer Declined",
        description: "You have declined the offer. Lender has been notified.",
      });
      // Refresh the page to update data
      window.location.reload();
    }
  };

  const handleEditService = (serviceId: string) => {
    toast({
      title: "Edit Service",
      description: "You can edit your service details here.",
    });
    // In a real app, navigate to service edit page or open a modal
  };

  const handleAddService = () => {
    toast({
      title: "Add Service",
      description: "Add a new service or product you can offer.",
    });
    // In a real app, navigate to add service page or open a modal
  };

  return (
    <Tabs defaultValue="requests" className="w-full">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="requests">Your Requests</TabsTrigger>
        <TabsTrigger value="offers">Received Offers</TabsTrigger>
        <TabsTrigger value="services">My Services</TabsTrigger>
      </TabsList>
      
      <TabsContent value="requests" className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Your Loan Requests</h3>
          <Button onClick={onCreateLoan}>
            <span>Create New Request</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your loan requests...</p>
          </div>
        ) : userLoans && userLoans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userLoans.map(loan => (
              <LoanRequestCard
                key={loan.id}
                id={loan.id}
                amount={parseFloat(loan.amount.toString())}
                status={loan.status}
                requestDate={new Date(loan.created_at).toLocaleDateString()}
                offersCount={0} // This would be calculated in a real app
                onViewDetails={onViewLoanDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't created any loan requests yet</p>
            <Button onClick={onCreateLoan}>Create Your First Request</Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="offers" className="space-y-6">
        <h3 className="text-xl font-semibold mb-6">Offers on Your Requests</h3>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading offers...</p>
          </div>
        ) : receivedOffers && receivedOffers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {receivedOffers.map(offer => (
              <OfferCard
                key={offer.id}
                id={offer.id}
                amount={parseFloat(offer.amount.toString())}
                status={offer.status}
                offerDate={new Date(offer.created_at).toLocaleDateString()}
                loanId={offer.loan_id}
                lenderName={offer.lender?.name || "Unknown Lender"}
                message={offer.message || ""}
                onViewDetails={onViewLoanDetails}
                onAccept={handleAcceptOffer}
                onDecline={handleDeclineOffer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">You haven't received any offers yet</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="services" className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Your Services & Products</h3>
          <Button onClick={handleAddService}>
            <span>Add New Service</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                value={service.value}
                onEdit={handleEditService}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't added any services or products yet</p>
            <Button onClick={handleAddService}>Add Your First Service</Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default BorrowerTabs;
