
import React from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { DollarSign, HandCoins, Star } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import BorrowerTabs from '@/components/dashboard/BorrowerTabs';
import LenderTabs from '@/components/dashboard/LenderTabs';
import { useLoansData } from '@/hooks/useLoansData';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { userLoans, availableLoans, receivedOffers, madeOffers, loading } = useLoansData();

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

  // Mock services data - in a real app, this would come from API
  const services = [];

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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Value"
              value={`₹${user?.user_metadata?.role === 'borrower' 
                ? userLoans?.reduce((sum, loan) => sum + parseFloat(loan.amount.toString()), 0) || 0
                : madeOffers?.reduce((sum, offer) => sum + parseFloat(offer.amount.toString()), 0) || 0
              }`}
              icon={DollarSign}
            />
            
            <StatCard
              title="Active Exchanges"
              value={user?.user_metadata?.role === 'borrower'
                ? userLoans?.filter(loan => loan.status === 'active').length || 0
                : madeOffers?.filter(offer => offer.status === 'accepted').length || 0
              }
              icon={HandCoins}
            />
            
            <StatCard
              title="Rating"
              value={<span>0 <span className="text-sm text-gray-500 ml-2">(0 reviews)</span></span>}
              icon={Star}
              iconColor="text-yellow-500"
            />
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : user?.user_metadata?.role === 'borrower' ? (
            <BorrowerTabs
              services={services}
              onCreateLoan={handleCreateLoan}
              onViewLoanDetails={handleViewLoanDetails}
            />
          ) : (
            <LenderTabs
              offers={madeOffers || []}
              availableLoans={availableLoans || []}
              onViewLoanDetails={handleViewLoanDetails}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
