
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, DollarSign, Handshake } from 'lucide-react';

const Offers = () => {
  const { isAuthenticated, user } = useAuth();
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect lenders to loans page
  useEffect(() => {
    if (isAuthenticated && user?.user_metadata?.role === 'lender') {
      navigate('/loans');
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch borrower's loans with their offers
  useEffect(() => {
    const fetchMyLoans = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setLoading(true);
        // First get all loans created by this borrower
        const { data: loans, error: loansError } = await supabase
          .from('loans')
          .select('*')
          .eq('borrower_id', user.id);

        if (loansError) throw loansError;

        if (loans && loans.length > 0) {
          // For simplicity, we're just using the loans data
          // In a real app, you would fetch offers for each loan
          setMyLoans(loans);
        } else {
          setMyLoans([]);
        }
      } catch (error) {
        console.error('Error fetching loans and offers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your loans and offers',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyLoans();
  }, [isAuthenticated, user, toast]);

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
          
          <Tabs defaultValue="myLoans" className="w-full">
            <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="myLoans">My Loan Requests</TabsTrigger>
              <TabsTrigger value="receivedOffers">Received Offers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="myLoans" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading your loan requests...</p>
                </div>
              ) : myLoans.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {myLoans.map(loan => (
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
                              <Button size="sm" variant="destructive" onClick={() => {}}>
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
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <Handshake className="h-16 w-16 text-primary mb-4" />
                  <p className="text-gray-500 mb-4">You haven't received any offers yet for your loan requests.</p>
                  <p className="text-gray-500 mb-4">Once lenders show interest in your requests, their offers will appear here.</p>
                  {myLoans.length === 0 && (
                    <Link to="/create-loan">
                      <Button>Create Your First Loan Request</Button>
                    </Link>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Offers;
