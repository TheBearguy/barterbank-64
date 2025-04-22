import React from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { DollarSign, HandCoins, Star, IndianRupee, FileText, Clock, CheckCircle } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import BorrowerTabs from '@/components/dashboard/BorrowerTabs';
import LenderTabs from '@/components/dashboard/LenderTabs';
import { useLoansData } from '@/hooks/useLoansData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatNumber } from '@/lib/utils';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    userLoans, 
    availableLoans, 
    receivedOffers, 
    madeOffers, 
    loading,
    updateOfferStatus
  } = useLoansData();

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleCreateLoan = () => {
    console.log("Dashboard: navigating to create-loan");
    navigate('/create-loan');
  };

  const handleViewLoanDetails = (loanId: string) => {
    navigate(`/loans/${loanId}`);
  };

  const handleViewRepayment = (offerId: string) => {
    navigate(`/offers/${offerId}/repayment`);
  };

  const handleAcceptOffer = async (offerId: string, note?: string) => {
    const success = await updateOfferStatus(offerId, 'accepted', note);
    if (success) {
      toast({
        title: "Offer Accepted",
        description: "You have accepted the offer. Borrower has been notified.",
      });
      // Refresh to update data
      window.location.reload();
    }
  };

  const handleDeclineOffer = async (offerId: string, note?: string) => {
    const success = await updateOfferStatus(offerId, 'rejected', note);
    if (success) {
      toast({
        title: "Offer Declined",
        description: "You have declined the offer. Borrower has been notified.",
      });
      // Refresh to update data
      window.location.reload();
    }
  };

  const handleCounterOffer = async (offerId: string, amount: number, note: string) => {
    const success = await updateOfferStatus(offerId, 'counter', note);
    if (success) {
      toast({
        title: "Counter Offer Sent",
        description: "Your counter offer has been sent to the borrower.",
      });
      // Refresh to update data
      window.location.reload();
    }
  };

  const totalValue = user?.user_metadata?.role === 'borrower' 
    ? userLoans?.reduce((sum, loan) => {
        // For borrowers, only include loans that have been funded (payment completed)
        if (loan.payment_status === 'completed') {
          return sum + parseFloat(loan.amount.toString());
        }
        return sum;
      }, 0) || 0
    : madeOffers?.reduce((sum, offer) => {
        // For lenders, include all pending and accepted offers
        if (offer.status === 'pending' || (offer.status === 'accepted' && offer.repayment_status !== 'completed')) {
          return sum + parseFloat(offer.amount.toString());
        }
        return sum;
      }, 0) || 0;

  const activeLoans = user?.user_metadata?.role === 'borrower'
    ? userLoans?.filter(loan => loan.status === 'active' && loan.payment_status === 'completed').length || 0
    : madeOffers?.filter(offer => offer.status === 'accepted' && offer.repayment_status === 'completed').length || 0;

  const pendingOffers = user?.user_metadata?.role === 'borrower'
    ? userLoans?.filter(loan => loan.status === 'pending').length || 0
    : receivedOffers?.filter(offer => offer.status === 'pending').length || 0;

  const completedLoans = user?.user_metadata?.role === 'borrower'
    ? userLoans?.filter(loan => loan.status === 'completed').length || 0
    : madeOffers?.filter(offer => offer.status === 'completed').length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your {user?.user_metadata?.role === 'borrower' ? 'loan requests and services' : 'offers and opportunities'}
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={user?.user_metadata?.role === 'borrower' ? "Total Debt" : "Pending Amount"}
              value={formatNumber(totalValue)}
              icon={IndianRupee}
              isDebt={user?.user_metadata?.role === 'borrower'}
              isPending={user?.user_metadata?.role === 'lender'}
            />
            <StatCard
              title="Active Loans"
              value={activeLoans}
              icon={FileText}
            />
            <StatCard
              title="Pending Offers"
              value={pendingOffers}
              icon={Clock}
            />
            <StatCard
              title="Completed"
              value={completedLoans}
              icon={CheckCircle}
            />
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : user?.user_metadata?.role === 'borrower' ? (
            <BorrowerTabs
              onCreateLoan={handleCreateLoan}
              onViewLoanDetails={handleViewLoanDetails}
            />
          ) : (
            <LenderTabs
              offers={madeOffers || []}
              availableLoans={availableLoans || []}
              onViewLoanDetails={handleViewLoanDetails}
              onViewRepayment={handleViewRepayment}
              onAcceptOffer={handleAcceptOffer}
              onDeclineOffer={handleDeclineOffer}
              onCounterOffer={handleCounterOffer}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
