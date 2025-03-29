
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLoansData } from '@/hooks/useLoansData';
import { Clock, DollarSign, Handshake, CheckCircle, X, RefreshCw } from 'lucide-react';
import OfferCard from '@/components/dashboard/OfferCard';

const Offers = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userLoans, receivedOffers, loading, updateOfferStatus } = useLoansData();
  const [activeTab, setActiveTab] = useState('myLoans');

  // Redirect lenders to loans page
  useEffect(() => {
    if (isAuthenticated && user?.user_metadata?.role === 'lender') {
      navigate('/loans');
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleViewLoanDetails = (loanId: string) => {
    navigate(`/loans/${loanId}`);
  };

  const handleAcceptOffer = async (offerId: string) => {
    const success = await updateOfferStatus(offerId, 'accepted');
    if (success) {
      toast({
        title: "Offer Accepted",
        description: "The loan offer has been accepted and the loan is now active.",
      });
      // Refresh the page to update the data
      window.location.reload();
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    const success = await updateOfferStatus(offerId, 'rejected');
    if (success) {
      toast({
        title: "Offer Declined",
        description: "The loan offer has been declined.",
      });
      // Refresh the page to update the data
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Loan Requests & Offers</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your loan requests and view offers from lenders
            </p>
          </div>

          <div className="flex justify-end mb-6">
            <Link to="/create-loan">
              <Button className="button-shine">
                Create New Loan Request
              </Button>
            </Link>
          </div>
          
          <Tabs defaultValue="myLoans" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="myLoans">My Loan Requests</TabsTrigger>
              <TabsTrigger value="receivedOffers">Received Offers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="myLoans" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading your loan requests...</p>
                </div>
              ) : userLoans.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {userLoans.map(loan => (
                    <Card key={loan.id} className="overflow-hidden hover:shadow-elevation transition-shadow">
                      <CardHeader className="pb-2 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              ₹{loan.amount}
                              <span className="ml-4 text-sm font-normal text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(loan.created_at).toLocaleDateString()}
                              </span>
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {loan.description}
                            </CardDescription>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            loan.status === 'active' ? 'bg-green-100 text-green-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {loan.status}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                          <div className="flex items-center mb-4 md:mb-0">
                            <DollarSign className="text-primary mr-2 h-5 w-5" />
                            <span className="text-gray-700">Request Amount: ₹{loan.amount}</span>
                          </div>
                          
                          <div className="flex gap-3">
                            <Link to={`/loans/${loan.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                            {loan.status === 'pending' && (
                              <Button size="sm" variant="destructive" onClick={() => {
                                toast({
                                  title: "Coming Soon",
                                  description: "Canceling loan requests will be available soon.",
                                });
                              }}>
                                Cancel Request
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't created any loan requests yet</p>
                  <Link to="/create-loan">
                    <Button>Create Your First Loan Request</Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="receivedOffers" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading offers...</p>
                </div>
              ) : receivedOffers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {receivedOffers.map(offer => (
                    <OfferCard
                      key={offer.id}
                      id={offer.id}
                      amount={parseInt(offer.amount.toString())}
                      status={offer.status}
                      offerDate={new Date(offer.created_at).toLocaleDateString()}
                      loanId={offer.loan_id}
                      lenderName={offer.lender?.name || "Unknown Lender"}
                      message={offer.message || ""}
                      onViewDetails={handleViewLoanDetails}
                      onAccept={handleAcceptOffer}
                      onDecline={handleDeclineOffer}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <Handshake className="h-16 w-16 text-primary mb-4" />
                    <p className="text-gray-500 mb-4">You haven't received any offers yet for your loan requests.</p>
                    <p className="text-gray-500 mb-4">Once lenders show interest in your requests, their offers will appear here.</p>
                    {userLoans.length === 0 && (
                      <Link to="/create-loan">
                        <Button>Create Your First Loan Request</Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Offers;
