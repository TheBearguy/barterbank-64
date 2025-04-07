
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import LoanRequestCard from './LoanRequestCard';
import OfferCard from './OfferCard';
import ServiceCard from './ServiceCard';
import { useToast } from '@/hooks/use-toast';
import { useLoansData } from '@/hooks/useLoansData';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import AddServiceModal from './AddServiceModal';

interface BorrowerTabsProps {
  onCreateLoan: () => void;
  onViewLoanDetails: (id: string) => void;
}

const BorrowerTabs = ({
  onCreateLoan,
  onViewLoanDetails
}: BorrowerTabsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userLoans, receivedOffers, loading, updateOfferStatus } = useLoansData();
  const { services, loading: servicesLoading, refreshData } = useDashboardData();
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  
  const handleCreateLoan = () => {
    console.log("Create loan button clicked");
    // Use both the prop and direct navigation for redundancy
    onCreateLoan();
    navigate('/create-loan');
  };

  const handleAcceptOffer = async (offerId: string, note?: string) => {
    const success = await updateOfferStatus(offerId, 'accepted', note);
    if (success) {
      toast({
        title: "Offer Accepted",
        description: note 
          ? "You have accepted the offer with a note. Lender has been notified." 
          : "You have accepted the offer. Lender has been notified.",
      });
      // Refresh the page to update data
      window.location.reload();
    }
  };

  const handleDeclineOffer = async (offerId: string, note?: string) => {
    const success = await updateOfferStatus(offerId, 'rejected', note);
    if (success) {
      toast({
        title: "Offer Declined",
        description: note 
          ? "You have declined the offer with a note. Lender has been notified." 
          : "You have declined the offer. Lender has been notified.",
      });
      // Refresh the page to update data
      window.location.reload();
    }
  };

  const handleCounterOffer = async (offerId: string, amount: number, note: string) => {
    // First, update the original offer status to 'counter'
    const success = await updateOfferStatus(offerId, 'counter', note);
    if (success) {
      toast({
        title: "Counter Offer Sent",
        description: "Your counter offer has been sent to the lender.",
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
    setIsAddServiceModalOpen(true);
  };

  const handleServiceAdded = () => {
    refreshData();
  };

  return (
    <>
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="requests">Your Requests</TabsTrigger>
          <TabsTrigger value="offers">Received Offers</TabsTrigger>
          <TabsTrigger value="services">My Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Your Loan Requests</h3>
            <Button onClick={handleCreateLoan}>
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
              <Button onClick={handleCreateLoan}>Create Your First Request</Button>
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
                  borrowerNote={offer.borrower_note}
                  onViewDetails={onViewLoanDetails}
                  onAccept={handleAcceptOffer}
                  onDecline={handleDeclineOffer}
                  onCounter={handleCounterOffer}
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
          
          {servicesLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading your services...</p>
            </div>
          ) : services && services.length > 0 ? (
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
      
      <AddServiceModal 
        open={isAddServiceModalOpen} 
        onOpenChange={setIsAddServiceModalOpen}
        onServiceAdded={handleServiceAdded}
      />
    </>
  );
};

export default BorrowerTabs;
