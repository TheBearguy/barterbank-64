
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Clock, DollarSign, HandCoins, Send, Star, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Initialize empty arrays for new users instead of dummy data
  const mockLoans = [];
  const mockOffers = [];
  const mockServices = [];

  // Filter loans to only show ones created by the current user
  const userLoans = mockLoans.filter(loan => loan.createdBy === user?.id);

  // Only show services created by the current user
  const userServices = mockServices.filter(service => service.createdBy === user?.id);

  const handleViewLoanDetails = (loanId) => {
    // Navigate to the loan details page
    navigate(`/loans/${loanId}`);
  };

  const handleCreateLoan = () => {
    navigate('/create-loan');
  };

  const handleAcceptOffer = (offerId) => {
    // Navigate to loan details page for this offer (assuming offers have a loanId property)
    const offer = mockOffers.find(o => o.id === offerId);
    if (offer) {
      toast({
        title: "Offer Accepted",
        description: "You have accepted the offer. Lender has been notified.",
      });
      navigate(`/loans/${offer.loanId}`);
    }
  };

  const handleDeclineOffer = (offerId) => {
    toast({
      title: "Offer Declined",
      description: "You have declined the offer. Lender has been notified.",
    });
    // In a real app, you would update the offer status in the database
  };

  const handleEditService = (serviceId) => {
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

  const renderBorrowerDashboard = () => (
    <Tabs defaultValue="loans" className="w-full">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="loans">My Loan Requests</TabsTrigger>
        <TabsTrigger value="offers">Received Offers</TabsTrigger>
        <TabsTrigger value="services">My Services</TabsTrigger>
      </TabsList>
      
      <TabsContent value="loans" className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Your Loan Requests</h3>
          <Button onClick={handleCreateLoan}>
            <span>Create New Request</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        {userLoans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userLoans.map(loan => (
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
                  <CardDescription className="mt-2">Requested on {loan.requestDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {loan.offersCount} Offers received
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewLoanDetails(loan.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
        
        {mockOffers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {mockOffers.map(offer => (
              <Card key={offer.id} className="hover:shadow-elevation transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>₹{offer.amount}</CardTitle>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {offer.status}
                    </div>
                  </div>
                  <CardDescription className="mt-2">Offered on {offer.offerDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      For Loan Request #{offer.loanId}
                    </span>
                    <div className="space-x-2">
                      {offer.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeclineOffer(offer.id)}
                          >
                            Decline
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleAcceptOffer(offer.id)}
                          >
                            Accept
                          </Button>
                        </>
                      )}
                      {offer.status === 'accepted' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewLoanDetails(offer.loanId)}
                        >
                          View Details
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
        
        {userServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userServices.map(service => (
              <Card key={service.id} className="hover:shadow-elevation transition-shadow">
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">₹{service.value}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditService(service.id)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

  const renderLenderDashboard = () => (
    <Tabs defaultValue="offers" className="w-full">
      <TabsList className="grid grid-cols-2 mb-8">
        <TabsTrigger value="offers">My Offers</TabsTrigger>
        <TabsTrigger value="browse">Browse Requests</TabsTrigger>
      </TabsList>
      
      <TabsContent value="offers" className="space-y-6">
        <h3 className="text-xl font-semibold mb-6">Your Active Offers</h3>
        
        {mockOffers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {mockOffers.map(offer => (
              <Card key={offer.id} className="hover:shadow-elevation transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>₹{offer.amount}</CardTitle>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {offer.status}
                    </div>
                  </div>
                  <CardDescription>Sent on {offer.offerDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      For Loan Request #{offer.loanId}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewLoanDetails(offer.loanId)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
        
        {mockLoans.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {mockLoans.map(loan => (
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
                        onClick={() => handleViewLoanDetails(loan.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleViewLoanDetails(loan.id)}
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

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your {user?.role === 'borrower' ? 'loan requests and services' : 'offers and opportunities'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">₹0</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active Exchanges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <HandCoins className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">0</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-sm text-gray-500 ml-2">(0 reviews)</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {user?.role === 'borrower' ? renderBorrowerDashboard() : renderLenderDashboard()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
