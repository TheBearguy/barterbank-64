
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import PaymentDialog from '@/components/loans/PaymentDialog';
import CustomOfferDialog from '@/components/loans/CustomOfferDialog';
import NegotiationDialog from '@/components/loans/NegotiationDialog';
import RatingDialog from '@/components/loans/RatingDialog';
import RepaymentDialog from '@/components/loans/RepaymentDialog';
import RepaymentResponseDialog from '@/components/loans/RepaymentResponseDialog';
import { supabase } from '@/integrations/supabase/client';
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
  ThumbsUp,
  Handshake,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLoansData } from '@/hooks/useLoansData';

const LoanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const { createLoanOffer, updateOfferStatus } = useLoansData();
  const [loan, setLoan] = useState<any>(null);
  const [borrower, setBorrower] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [userOffers, setUserOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCustomOfferDialogOpen, setIsCustomOfferDialogOpen] = useState(false);
  const [isNegotiationDialogOpen, setIsNegotiationDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isRepaymentDialogOpen, setIsRepaymentDialogOpen] = useState(false);
  const [isRepaymentResponseDialogOpen, setIsRepaymentResponseDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  if (!id) {
    navigate('/loans');
    return null;
  }

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch the loan with borrower information
        const { data: loanData, error: loanError } = await supabase
          .from('loans')
          .select(`
            *,
            borrower:profiles!borrower_id(id, name, email, role, avatar, balance)
          `)
          .eq('id', id)
          .single();
          
        if (loanError) throw loanError;
        
        setLoan(loanData);
        setBorrower(loanData.borrower);
        
        // Fetch offers for this loan
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select(`
            *,
            lender:profiles!lender_id(id, name, email, role, avatar)
          `)
          .eq('loan_id', id);
          
        if (offersError) throw offersError;
        
        setOffers(offersData || []);
        
        // If the user is logged in, check for their offers
        if (user) {
          const userOffersFiltered = offersData?.filter(
            offer => offer.lender_id === user.id
          ) || [];
          setUserOffers(userOffersFiltered);
          
          // Check if the user has an accepted offer
          const acceptedOffer = userOffersFiltered.find(
            offer => offer.status === 'accepted'
          );
          
          if (acceptedOffer) {
            setOfferSubmitted(true);
            setOfferAccepted(true);
            
            // Check if repayment process has already started, which means payment was completed
            if (acceptedOffer.repayment_status && acceptedOffer.repayment_status !== 'pending') {
              setPaymentCompleted(true);
            }
          } else if (userOffersFiltered.length > 0) {
            setOfferSubmitted(true);
          }
        }
      } catch (error) {
        console.error('Error fetching loan details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load loan details.',
          variant: 'destructive',
        });
        navigate('/loans');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanDetails();
  }, [id, user, navigate, toast]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow py-20 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <p className="text-gray-500">Loading loan details...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
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

  const handleFundLoan = async () => {
    try {
      const result = await createLoanOffer(
        id || '', 
        parseFloat(loan.amount.toString()), 
        "I'd like to fund your loan request in full."
      );
      
      if (result) {
        setOfferSubmitted(true);
        toast({
          title: "Offer submitted!",
          description: "Your offer has been sent to the borrower. You'll be notified when they accept.",
        });
        
        // Refresh the page to update the data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit offer.',
        variant: 'destructive',
      });
    }
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
    setPaymentCompleted(true);
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

  const handleOfferSubmit = async (amount: number, message: string) => {
    try {
      const result = await createLoanOffer(id || '', amount, message);
      
      if (result) {
        setUserOffers([...userOffers, result]);
        setOfferSubmitted(true);
        setIsCustomOfferDialogOpen(false);
        
        toast({
          title: "Offer submitted!",
          description: "Your offer has been sent to the borrower.",
        });
        
        // Refresh the page to update the data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit offer.',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptOffer = () => {
    setOfferAccepted(true);
    toast({
      title: "Offer accepted!",
      description: "You can now proceed with the payment.",
    });
  };

  const handleInitiateRepayment = () => {
    setIsRepaymentDialogOpen(true);
  };

  const handleRepaymentProposed = () => {
    // Refresh the data after a repayment is proposed
    window.location.reload();
  };

  const handleViewRepaymentProposal = (offer: any) => {
    setSelectedOffer(offer);
    setIsRepaymentResponseDialogOpen(true);
  };

  const handleRepaymentResponseSent = () => {
    // Refresh the data after a response is sent
    window.location.reload();
  };
  
  // Handle counter offer from lender side
  const handleCounterOffer = async (offerId: string, amount: number, message: string) => {
    try {
      // First update the offer status to counter
      await updateOfferStatus(offerId, 'counter');
      
      toast({
        title: "Counter offer sent",
        description: "Your counter offer has been sent to the borrower.",
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error creating counter offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to send counter offer.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle accepting an offer as lender
  const handleAcceptOfferAsLender = async (offerId: string, note?: string) => {
    try {
      await updateOfferStatus(offerId, 'accepted');
      
      toast({
        title: "Offer accepted",
        description: "You have accepted the borrower's offer.",
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept offer.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle declining an offer as lender
  const handleDeclineOfferAsLender = async (offerId: string, note?: string) => {
    try {
      await updateOfferStatus(offerId, 'rejected');
      
      toast({
        title: "Offer declined",
        description: "You have declined the borrower's offer.",
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error declining offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline offer.',
        variant: 'destructive',
      });
    }
  };

  // Find an accepted offer for this loan
  const acceptedOffer = offers.find(offer => offer.status === 'accepted');

  // Check if the current user is the borrower
  const isBorrower = user && borrower && user.id === borrower.id;
  
  // Check if the current user is the lender
  const isLender = user && acceptedOffer && user.id === acceptedOffer.lender_id;

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
                        <Badge variant="outline" className={`ml-2 ${
                          loan.status === 'active' ? 'bg-green-100 text-green-800' : 
                          loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {loan.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Posted on {new Date(loan.created_at).toLocaleDateString()}</span>
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
                          {borrower?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{borrower?.name || 'Unknown'}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>Rating to be implemented</span>
                            <span className="mx-2">•</span>
                            <span>0 completed exchanges</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Repayment Status Section - show only for active loans */}
                    {loan.status === 'active' && acceptedOffer && (
                      <div>
                        <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
                          <RefreshCw className="h-5 w-5 text-primary" />
                          Repayment Status
                        </h3>
                        
                        {acceptedOffer.repayment_status && acceptedOffer.repayment_status !== 'pending' ? (
                          <div className="mb-4 rounded-md border p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Current Repayment Proposal</h4>
                              <Badge className={`${
                                acceptedOffer.repayment_status === 'proposed' ? 'bg-blue-100 text-blue-800' :
                                acceptedOffer.repayment_status === 'accepted' ? 'bg-green-100 text-green-800' :
                                acceptedOffer.repayment_status === 'counter' ? 'bg-amber-100 text-amber-800' :
                                acceptedOffer.repayment_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {acceptedOffer.repayment_status === 'proposed' ? 'Proposed' :
                                 acceptedOffer.repayment_status === 'accepted' ? 'Accepted' :
                                 acceptedOffer.repayment_status === 'counter' ? 'Counter Offered' :
                                 acceptedOffer.repayment_status === 'rejected' ? 'Rejected' : 'Unknown'}
                              </Badge>
                            </div>
                            
                            {acceptedOffer.repayment_status === 'proposed' && acceptedOffer.borrower_repayment_proposal && (
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Proposed by:</span>
                                  <span className="font-medium">Borrower</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Method:</span>
                                  <span className="font-medium capitalize">
                                    {acceptedOffer.borrower_repayment_proposal.method}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Amount:</span>
                                  <span className="font-medium">₹{acceptedOffer.borrower_repayment_proposal.amount}</span>
                                </div>
                                
                                {isBorrower && (
                                  <div className="mt-4 text-center text-gray-500">
                                    Waiting for lender's response...
                                  </div>
                                )}
                                
                                {isLender && (
                                  <div className="mt-4">
                                    <Button 
                                      onClick={() => handleViewRepaymentProposal(acceptedOffer)}
                                      className="w-full"
                                    >
                                      Review Proposal
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {acceptedOffer.repayment_status === 'counter' && acceptedOffer.lender_repayment_proposal && (
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Proposed by:</span>
                                  <span className="font-medium">Lender</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Method:</span>
                                  <span className="font-medium capitalize">
                                    {acceptedOffer.lender_repayment_proposal.method}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Amount:</span>
                                  <span className="font-medium">₹{acceptedOffer.lender_repayment_proposal.amount}</span>
                                </div>
                                
                                {isLender && (
                                  <div className="mt-4 text-center text-gray-500">
                                    Waiting for borrower's response...
                                  </div>
                                )}
                                
                                {isBorrower && (
                                  <div className="mt-4">
                                    <Button 
                                      onClick={() => handleInitiateRepayment()}
                                      className="w-full"
                                    >
                                      Respond to Counter Offer
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {acceptedOffer.repayment_status === 'accepted' && (
                              <div className="bg-green-50 p-3 rounded-md text-center">
                                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <p className="text-green-700 font-medium">Repayment terms accepted!</p>
                                <p className="text-sm text-green-600">
                                  The repayment proposal has been accepted. Proceed with the agreed terms.
                                </p>
                              </div>
                            )}
                            
                            {acceptedOffer.repayment_status === 'rejected' && (
                              <div className="bg-red-50 p-3 rounded-md text-center">
                                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                <p className="text-red-700 font-medium">Repayment terms rejected</p>
                                <p className="text-sm text-red-600">
                                  The repayment proposal was rejected. 
                                  {isBorrower && " Please propose new terms."}
                                </p>
                                
                                {isBorrower && (
                                  <Button 
                                    onClick={() => handleInitiateRepayment()}
                                    variant="outline"
                                    className="mt-3"
                                  >
                                    Propose New Terms
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          // No repayment proposal yet
                          <div className="text-center py-6 border rounded-md">
                            {isBorrower ? (
                              <>
                                <Handshake className="h-12 w-12 text-primary mx-auto mb-3" />
                                <p className="text-gray-700 mb-3">
                                  Ready to repay your loan? You can propose repayment terms to the lender.
                                </p>
                                <Button onClick={() => handleInitiateRepayment()}>
                                  Initiate Repayment
                                </Button>
                              </>
                            ) : (
                              <>
                                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 mb-2">
                                  Waiting for the borrower to initiate repayment.
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {isAuthenticated && user?.user_metadata?.role === 'lender' && (
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
                    ) : offerAccepted && !paymentCompleted ? (
                      <Button 
                        className="w-full" 
                        onClick={openPaymentDialog}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Complete Payment
                      </Button>
                    ) : offerAccepted && paymentCompleted ? (
                      <div className="p-4 rounded-md bg-green-50 text-green-700 border border-green-200">
                        <h4 className="font-medium flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Payment Completed
                        </h4>
                        <p className="text-sm">Your payment has been processed. Waiting for borrower to propose repayment terms.</p>
                      </div>
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
                  <CardTitle>Loan Timeline</CardTitle>
                  <CardDescription>History of this loan request</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ol className="relative border-l border-gray-200 dark:border-gray-700">
                    <li className="mb-6 ml-4">
                      <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                        {new Date(loan.created_at).toLocaleDateString()}
                      </time>
                      <p className="text-base font-normal text-gray-700 dark:text-gray-300">
                        Loan request created
                      </p>
                    </li>
                    
                    {offers.length > 0 && offers.map((offer, index) => (
                      <li className="mb-6 ml-4" key={offer.id}>
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                          {new Date(offer.created_at).toLocaleDateString()}
                        </time>
                        <p className="text-base font-normal text-gray-700 dark:text-gray-300">
                          {offer.status === 'accepted' 
                            ? `Offer accepted from ${offer.lender?.name || 'a lender'}`
                            : `New offer received from ${offer.lender?.name || 'a lender'}`}
                        </p>
                      </li>
                    ))}
                    
                    {loan.status === 'active' && (
                      <li className="mb-6 ml-4">
                        <div className="absolute w-3 h-3 bg-green-500 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                          {new Date(loan.updated_at).toLocaleDateString()}
                        </time>
                        <p className="text-base font-normal text-gray-700 dark:text-gray-300">
                          Loan funded and active
                        </p>
                      </li>
                    )}
                    
                    {acceptedOffer && acceptedOffer.repayment_status && acceptedOffer.repayment_status !== 'pending' && (
                      <li className="mb-6 ml-4">
                        <div className="absolute w-3 h-3 bg-purple-500 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900"></div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                          {new Date().toLocaleDateString()}
                        </time>
                        <p className="text-base font-normal text-gray-700 dark:text-gray-300">
                          {acceptedOffer.repayment_status === 'proposed'
                            ? 'Borrower proposed repayment terms'
                            : acceptedOffer.repayment_status === 'counter'
                            ? 'Lender made a counter proposal'
                            : acceptedOffer.repayment_status === 'accepted'
                            ? 'Repayment terms accepted'
                            : 'Repayment terms rejected'}
                        </p>
                      </li>
                    )}
                  </ol>
                </CardContent>
              </Card>

              {userOffers.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle>Your Offers</CardTitle>
                    <CardDescription>History of your offers for this loan</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {userOffers.map((offer, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Offer #{index + 1}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(offer.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-lg font-bold flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            {offer.amount}
                          </p>
                          <div className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            offer.status === 'counter' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {offer.status}
                          </div>
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
          previousOffers={userOffers.map(offer => ({
            amount: parseFloat(offer.amount.toString()),
            message: offer.message || ""
          }))}
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
            name: borrower?.name || 'Unknown',
            role: 'borrower'
          }}
        />
      )}

      {isRepaymentDialogOpen && (
        <RepaymentDialog
          isOpen={isRepaymentDialogOpen}
          onClose={() => setIsRepaymentDialogOpen(false)}
          loanDetails={{
            id: loan.id,
            amount: loan.amount,
            offer_id: acceptedOffer?.id
          }}
          onRepaymentProposed={handleRepaymentProposed}
        />
      )}

      {isRepaymentResponseDialogOpen && selectedOffer && (
        <RepaymentResponseDialog
          isOpen={isRepaymentResponseDialogOpen}
          onClose={() => setIsRepaymentResponseDialogOpen(false)}
          offer={selectedOffer}
          onResponseSent={handleRepaymentResponseSent}
        />
      )}
    </div>
  );
};

export default LoanDetails;
