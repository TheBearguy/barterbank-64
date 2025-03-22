
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import PaymentDialog from '@/components/loans/PaymentDialog';
import CustomOfferDialog from '@/components/loans/CustomOfferDialog';
import NegotiationDialog from '@/components/loans/NegotiationDialog';
import RatingDialog from '@/components/loans/RatingDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Star, 
  IndianRupee, 
  FileText, 
  User, 
  MessageCircle, 
  Shield, 
  CreditCard, 
  CheckCircle2,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getLoanDetails = (id: string) => {
  const mockLoans = [
    {
      id: '1',
      borrower: {
        name: 'Ravi Kumar',
        rating: 4.8,
        completedExchanges: 12,
        profileImage: null,
      },
      amount: 5000,
      description: 'Need funds for small business inventory. Can offer web development services or home-cooked meals in return.',
      requestDate: '2023-10-15',
      services: ['Web Development', 'Cooking'],
      status: 'active',
      offersCount: 3,
      timeline: [
        { date: '2023-10-15', event: 'Loan request created' },
        { date: '2023-10-16', event: 'Received first offer' },
        { date: '2023-10-18', event: 'Additional offers received' },
      ],
      repaymentPlan: {
        monetary: 3000,
        services: [
          { name: 'Web Development', hours: 10, value: 1500 },
          { name: 'Home-cooked Meals', quantity: 5, value: 500 },
        ]
      },
      terms: 'Repayment within 30 days. Service delivery schedule to be mutually agreed upon.',
    },
    {
      id: '2',
      borrower: {
        name: 'Priya Singh',
        rating: 4.2,
        completedExchanges: 5,
        profileImage: null,
      },
      amount: 2000,
      description: 'Personal emergency. Can offer graphic design services or handmade crafts as repayment.',
      requestDate: '2023-11-05',
      services: ['Graphic Design', 'Handicrafts'],
      status: 'active',
      offersCount: 1,
      timeline: [
        { date: '2023-11-05', event: 'Loan request created' },
        { date: '2023-11-07', event: 'Received offer' },
      ],
      repaymentPlan: {
        monetary: 1000,
        services: [
          { name: 'Graphic Design', hours: 5, value: 700 },
          { name: 'Handmade Crafts', quantity: 3, value: 300 },
        ]
      },
      terms: 'Repayment within 45 days. Service quality to be as per samples provided.',
    },
    {
      id: '3',
      borrower: {
        name: 'Ajay Sharma',
        rating: 4.9,
        completedExchanges: 18,
        profileImage: null,
      },
      amount: 8000,
      description: 'Need to pay medical bills. Can offer carpentry work, furniture repair or gardening services.',
      requestDate: '2023-11-10',
      services: ['Carpentry', 'Gardening'],
      status: 'active',
      offersCount: 5,
      timeline: [
        { date: '2023-11-10', event: 'Loan request created' },
        { date: '2023-11-12', event: 'Multiple offers received' },
        { date: '2023-11-15', event: 'Negotiation in progress' },
      ],
      repaymentPlan: {
        monetary: 5000,
        services: [
          { name: 'Carpentry', hours: 15, value: 2250 },
          { name: 'Gardening', hours: 5, value: 750 },
        ]
      },
      terms: 'Repayment within 60 days. Service schedule to be determined based on lender preference.',
    },
    {
      id: '4',
      borrower: {
        name: 'Meera Patel',
        rating: 3.7,
        completedExchanges: 3,
        profileImage: null,
      },
      amount: 3500,
      description: 'Need money for college fees. Can teach mathematics or physics to high school students.',
      requestDate: '2023-11-12',
      services: ['Tutoring: Mathematics', 'Tutoring: Physics'],
      status: 'active',
      offersCount: 0,
      timeline: [
        { date: '2023-11-12', event: 'Loan request created' },
      ],
      repaymentPlan: {
        monetary: 2000,
        services: [
          { name: 'Mathematics Tutoring', hours: 10, value: 1000 },
          { name: 'Physics Tutoring', hours: 5, value: 500 },
        ]
      },
      terms: 'Repayment within 90 days. Tutoring services to be provided online or in-person based on mutual agreement.',
    },
  ];

  return mockLoans.find(loan => loan.id === id);
};

const LoanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCustomOfferDialogOpen, setIsCustomOfferDialogOpen] = useState(false);
  const [isNegotiationDialogOpen, setIsNegotiationDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  
  const [previousOffers, setPreviousOffers] = useState<any[]>([]);
  
  if (!id) {
    navigate('/loans');
    return null;
  }

  const loan = getLoanDetails(id);

  if (!loan) {
    navigate('/loans');
    return null;
  }

  const handleMakeOffer = () => {
    setIsCustomOfferDialogOpen(true);
  };

  const handleContactBorrower = () => {
    setIsNegotiationDialogOpen(true);
  };

  const handleFundLoan = () => {
    // Instead of opening payment dialog directly, set offer as submitted
    setOfferSubmitted(true);
    toast({
      title: "Offer submitted!",
      description: "Your offer has been sent to the borrower. You'll be notified when they accept.",
    });
  };

  const openPaymentDialog = () => {
    // Only open payment dialog if offer has been accepted
    if (offerAccepted) {
      setIsPaymentDialogOpen(true);
    } else {
      toast({
        title: "Offer not yet accepted",
        description: "The borrower needs to accept your offer before you can proceed with payment.",
        variant: "destructive",
      });
    }
  };

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
  };

  const handlePaymentComplete = () => {
    toast({
      title: "Payment successful!",
      description: "Your payment has been processed successfully.",
      variant: "default",
    });
    setIsPaymentDialogOpen(false);
    // After payment is complete, prompt for rating
    setIsRatingDialogOpen(true);
  };

  const handleRatingComplete = () => {
    setIsRatingDialogOpen(false);
    toast({
      title: "Thank you for your feedback!",
      description: "Your rating has been submitted successfully.",
    });
  };

  const handleOfferSubmit = () => {
    setPreviousOffers([
      ...previousOffers,
      {
        amount: parseFloat(loan.amount.toString()), 
        message: "Your offer has been submitted successfully. Awaiting borrower's response.",
        services: [...loan.services]
      }
    ]);
    
    setIsCustomOfferDialogOpen(false);
    setOfferSubmitted(true);
  };

  const handleAcceptOffer = () => {
    setOfferAccepted(true);
    toast({
      title: "Offer accepted!",
      description: "You can now proceed with the payment.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => navigate('/loans')}
          >
            ← Back to Loans
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden shadow-md">
                <CardHeader className="pb-2 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <IndianRupee className="h-6 w-6 text-primary" />
                        {loan.amount}
                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900">
                          {loan.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Posted on {loan.requestDate}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Loan Description
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">{loan.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
                        <User className="h-5 w-5 text-primary" />
                        Borrower Information
                      </h3>
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 text-lg font-medium">
                          {loan.borrower.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{loan.borrower.name}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{loan.borrower.rating}</span>
                            <span className="mx-2">•</span>
                            <span>{loan.borrower.completedExchanges} completed exchanges</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-primary" />
                        Repayment Terms
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{loan.terms}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-green-50 border-green-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-green-800">Monetary Repayment</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-green-700 flex items-center">
                              <IndianRupee className="h-5 w-5 mr-1" />
                              {loan.repaymentPlan.monetary}
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-blue-50 border-blue-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-blue-800">Services Value</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-blue-700 flex items-center">
                              <IndianRupee className="h-5 w-5 mr-1" />
                              {loan.repaymentPlan.services.reduce((sum, service) => sum + service.value, 0)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        Service Repayment Details
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Quantity/Hours</TableHead>
                            <TableHead className="text-right">Value (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loan.repaymentPlan.services.map((service, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{service.name}</TableCell>
                              <TableCell>
                                {service.hours ? `${service.hours} hours` : `${service.quantity} items`}
                              </TableCell>
                              <TableCell className="text-right">{service.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {isAuthenticated && user?.role === 'lender' && (
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle>Lender Actions</CardTitle>
                    <CardDescription>Help this borrower by providing funds</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {offerSubmitted && !offerAccepted ? (
                      <div className="p-4 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        <h4 className="font-medium flex items-center gap-2 mb-1">
                          <ThumbsUp className="h-4 w-4" />
                          Offer Submitted
                        </h4>
                        <p className="text-sm">Your offer has been sent to the borrower. You'll be notified when they accept.</p>
                        
                        <div className="mt-3 border-t pt-3 border-blue-200">
                          <p className="text-xs italic mb-2">Demo only: Simulate borrower actions</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full bg-white hover:bg-blue-50"
                            onClick={handleAcceptOffer}
                          >
                            Simulate Borrower Accepting Offer
                          </Button>
                        </div>
                      </div>
                    ) : offerAccepted ? (
                      <Button 
                        className="w-full" 
                        onClick={openPaymentDialog}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Complete Payment
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleFundLoan}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Fund This Loan
                      </Button>
                    )}
                    
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleMakeOffer}
                    >
                      Make Custom Offer
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="ghost"
                      onClick={handleContactBorrower}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Borrower
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Offered Services</CardTitle>
                  <CardDescription>Services available as repayment</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {loan.services.map((service, index) => (
                      <Badge 
                        key={index} 
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>Loan Timeline</CardTitle>
                  <CardDescription>History of this loan request</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ol className="relative border-l border-gray-200 dark:border-gray-700">
                    {loan.timeline.map((event, index) => (
                      <li className="mb-6 ml-4" key={index}>
                        <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-500">{event.date}</time>
                        <p className="text-base font-normal text-gray-700 dark:text-gray-300">{event.event}</p>
                      </li>
                    ))}
                    {offerSubmitted && (
                      <li className="mb-6 ml-4">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-500">{new Date().toISOString().split('T')[0]}</time>
                        <p className="text-base font-normal text-gray-700 dark:text-gray-300">
                          {offerAccepted ? "Offer accepted by borrower" : "New offer received"}
                        </p>
                      </li>
                    )}
                  </ol>
                </CardContent>
              </Card>

              {previousOffers.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle>Your Offers</CardTitle>
                    <CardDescription>History of your offers for this loan</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {previousOffers.map((offer, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Offer #{index + 1}</span>
                            <span className="text-xs text-gray-500">
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-lg font-bold flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {offer.amount}
                          </p>
                          {offer.message && (
                            <p className="text-sm mt-2 text-gray-700">{offer.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {isPaymentDialogOpen && (
        <PaymentDialog 
          loan={loan}
          isOpen={isPaymentDialogOpen}
          onClose={closePaymentDialog}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {isCustomOfferDialogOpen && (
        <CustomOfferDialog
          loan={loan}
          isOpen={isCustomOfferDialogOpen}
          onClose={() => setIsCustomOfferDialogOpen(false)}
          onOfferSubmit={handleOfferSubmit}
          previousOffers={previousOffers}
        />
      )}
      
      {isNegotiationDialogOpen && (
        <NegotiationDialog
          loan={loan}
          isOpen={isNegotiationDialogOpen}
          onClose={() => setIsNegotiationDialogOpen(false)}
        />
      )}

      {isRatingDialogOpen && (
        <RatingDialog
          isOpen={isRatingDialogOpen}
          onClose={() => setIsRatingDialogOpen(false)}
          userToRate={{
            name: loan.borrower.name,
            role: 'borrower'
          }}
        />
      )}
    </div>
  );
};

export default LoanDetails;
