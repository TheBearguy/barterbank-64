
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Wallet, 
  IndianRupee, 
  CheckCircle2, 
  Shield, 
  AlertCircle,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import RatingDialog from './RatingDialog';

interface PaymentDialogProps {
  loan: any;  // We would ideally type this properly
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ 
  loan, 
  isOpen, 
  onClose, 
  onPaymentComplete 
}) => {
  const [step, setStep] = useState<'method' | 'details' | 'confirmation' | 'rating'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'upi', name: 'UPI Payment', icon: <Wallet className="h-5 w-5" /> },
    { id: 'bank', name: 'Net Banking', icon: <IndianRupee className="h-5 w-5" /> },
  ];

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('details');
  };

  const handleSubmitDetails = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep('confirmation');
    }, 1500);
  };

  const handleComplete = () => {
    setStep('rating');
  };

  const handleRatingComplete = () => {
    onPaymentComplete();
  };

  const renderMethodSelection = () => (
    <>
      <DialogHeader>
        <DialogTitle>Complete Your Payment</DialogTitle>
        <DialogDescription>
          Your offer has been accepted by the borrower. Choose your payment method to fund this loan.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-start">
          <Shield className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700 font-medium">Secure Payment</p>
            <p className="text-xs text-blue-600">Your payment information is encrypted and secure</p>
          </div>
        </div>

        <p className="font-medium text-lg flex items-center">
          <span>Total Amount: </span>
          <span className="text-primary ml-2 flex items-center">
            <IndianRupee className="h-4 w-4 mr-1" />
            {loan.amount}
          </span>
        </p>

        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <Card 
              key={method.id}
              className={`cursor-pointer hover:border-primary transition-colors ${
                selectedMethod === method.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => handleSelectMethod(method.id)}
            >
              <CardContent className="p-4 flex items-center">
                <div className="mr-3 text-primary">{method.icon}</div>
                <span>{method.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </DialogFooter>
    </>
  );

  const renderPaymentDetails = () => (
    <>
      <DialogHeader>
        <DialogTitle>Enter Payment Details</DialogTitle>
        <DialogDescription>
          Please provide your {
            selectedMethod === 'card' ? 'card' : 
            selectedMethod === 'upi' ? 'UPI ID' : 'bank'
          } details
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4 space-y-4">
        {selectedMethod === 'card' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input 
                id="card-number" 
                placeholder="1234 5678 9012 3456" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input 
                  id="cvv" 
                  placeholder="123"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input 
                id="name" 
                placeholder="John Doe"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
              />
            </div>
          </>
        )}
        
        {selectedMethod === 'upi' && (
          <div className="space-y-2">
            <Label htmlFor="upi-id">UPI ID</Label>
            <Input id="upi-id" placeholder="yourname@upi" />
          </div>
        )}
        
        {selectedMethod === 'bank' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="bank">Select Bank</Label>
              <select 
                id="bank" 
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
              </select>
            </div>
          </>
        )}
      </div>
      
      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={() => setStep('method')}
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmitDetails}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Processing...
            </>
          ) : (
            <>Pay ₹{loan.amount}</>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderConfirmation = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">Payment Successful!</DialogTitle>
      </DialogHeader>
      
      <div className="py-6 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <p className="text-lg font-medium mb-2">Thank you for your payment</p>
        <p className="text-gray-600 mb-4">
          You have successfully funded ₹{loan.amount} to {loan.borrower.name}.
        </p>
        <div className="p-4 bg-blue-50 rounded-lg w-full">
          <p className="text-sm text-blue-800">
            A confirmation has been sent to your email. The borrower has been notified about your payment.
          </p>
        </div>
      </div>
      
      <DialogFooter>
        <Button onClick={handleComplete}>
          Continue
        </Button>
      </DialogFooter>
    </>
  );

  const renderRating = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">Rate Your Experience</DialogTitle>
      </DialogHeader>
      
      <div className="py-6 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <Star className="h-10 w-10 text-yellow-500" />
        </div>
        <p className="text-lg font-medium mb-2">How was your experience?</p>
        <p className="text-gray-600 mb-4">
          Please take a moment to rate your experience with {loan.borrower.name}.
        </p>
        <Button onClick={() => setIsRatingDialogOpen(true)} className="mb-4">
          Rate Now
        </Button>
        <p className="text-sm text-gray-500">
          You can also rate later from your dashboard.
        </p>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={handleRatingComplete}>
          Skip Rating
        </Button>
      </DialogFooter>

      {isRatingDialogOpen && (
        <RatingDialog 
          isOpen={isRatingDialogOpen}
          onClose={() => {
            setIsRatingDialogOpen(false);
            handleRatingComplete();
          }}
          userToRate={{
            name: loan.borrower.name,
            role: 'borrower'
          }}
        />
      )}
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'method' && renderMethodSelection()}
        {step === 'details' && renderPaymentDetails()}
        {step === 'confirmation' && renderConfirmation()}
        {step === 'rating' && renderRating()}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
