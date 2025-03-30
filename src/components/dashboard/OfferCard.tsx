
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { IndianRupee, MessageSquare, RefreshCw, Handshake, CreditCard, CheckCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OfferCardProps {
  id: string;
  amount: number;
  status: string;
  offerDate: string;
  loanId: string;
  lenderName?: string;
  message?: string;
  borrowerNote?: string;
  repaymentStatus?: string;
  borrowerRepaymentProposal?: any;
  lenderRepaymentProposal?: any;
  onViewDetails: (id: string) => void;
  onAccept?: (id: string, note?: string) => void;
  onDecline?: (id: string, note?: string) => void;
  onCounter?: (id: string, amount: number, note: string) => void;
  onViewRepayment?: (id: string) => void;
  paymentCompleted?: boolean;
  isLender?: boolean;
}

const OfferCard = ({ 
  id, 
  amount, 
  status, 
  offerDate, 
  loanId, 
  lenderName,
  message,
  borrowerNote,
  repaymentStatus,
  borrowerRepaymentProposal,
  lenderRepaymentProposal,
  onViewDetails,
  onAccept,
  onDecline,
  onCounter,
  onViewRepayment,
  paymentCompleted = false,
  isLender = false
}: OfferCardProps) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [counterAmount, setCounterAmount] = useState(amount.toString());
  const [counterNote, setCounterNote] = useState('');
  const [isCounterPopoverOpen, setIsCounterPopoverOpen] = useState(false);

  const handleAcceptWithNote = () => {
    if (onAccept) {
      onAccept(id, note);
      setShowNoteInput(false);
      setNote('');
    }
  };

  const handleDeclineWithNote = () => {
    if (onDecline) {
      onDecline(id, note);
      setShowNoteInput(false);
      setNote('');
    }
  };

  const handleCounterOffer = () => {
    if (onCounter && parseFloat(counterAmount) > 0) {
      onCounter(id, parseFloat(counterAmount), counterNote);
      setIsCounterPopoverOpen(false);
      setCounterAmount('');
      setCounterNote('');
    }
  };

  // If there's a repayment proposal and the status is accepted, show repayment info
  const hasRepaymentInfo = status === 'accepted' && (repaymentStatus || borrowerRepaymentProposal || lenderRepaymentProposal);

  return (
    <Card className="hover:shadow-elevation transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>₹{amount}</CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            status === 'accepted' ? 'bg-green-100 text-green-800' :
            status === 'rejected' ? 'bg-red-100 text-red-800' :
            status === 'counter' ? 'bg-blue-100 text-blue-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {status}
          </div>
        </div>
        <CardDescription className="mt-2">
          {lenderName && <span className="font-medium">{lenderName}</span>}
          <span className="ml-2">Offered on {offerDate}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md text-gray-700 text-sm">
            <p className="italic">{message}</p>
          </div>
        )}
        
        {borrowerNote && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md text-gray-700 text-sm">
            <h4 className="font-semibold mb-1 text-blue-800">Your response:</h4>
            <p className="italic">{borrowerNote}</p>
          </div>
        )}
        
        {hasRepaymentInfo && (
          <div className="mb-4 p-3 bg-green-50 rounded-md text-gray-700 text-sm border border-green-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-green-800 flex items-center">
                <RefreshCw className="h-4 w-4 mr-1" />
                Repayment
              </h4>
              {repaymentStatus && (
                <Badge className={`${
                  repaymentStatus === 'proposed' ? 'bg-blue-100 text-blue-800' :
                  repaymentStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                  repaymentStatus === 'counter' ? 'bg-amber-100 text-amber-800' :
                  repaymentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {repaymentStatus === 'proposed' ? 'Proposed' :
                   repaymentStatus === 'accepted' ? 'Accepted' :
                   repaymentStatus === 'counter' ? 'Counter' :
                   repaymentStatus === 'rejected' ? 'Rejected' : 'Pending'}
                </Badge>
              )}
            </div>
            
            {(borrowerRepaymentProposal || lenderRepaymentProposal) && (
              <div className="space-y-1 mt-1">
                {borrowerRepaymentProposal && repaymentStatus === 'proposed' && (
                  <>
                    <div className="flex items-center text-xs text-gray-600">
                      <span>Borrower proposes:</span>
                      <Badge variant="outline" className="ml-1 capitalize text-xs">
                        {borrowerRepaymentProposal.method === 'payment' ? (
                          <><CreditCard className="mr-1 h-3 w-3" /> Payment</>
                        ) : (
                          <><Handshake className="mr-1 h-3 w-3" /> Services</>
                        )}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">
                      ₹{borrowerRepaymentProposal.amount}
                    </div>
                  </>
                )}
                
                {lenderRepaymentProposal && repaymentStatus === 'counter' && (
                  <>
                    <div className="flex items-center text-xs text-gray-600">
                      <span>Lender counter:</span>
                      <Badge variant="outline" className="ml-1 capitalize text-xs">
                        {lenderRepaymentProposal.method === 'payment' ? (
                          <><CreditCard className="mr-1 h-3 w-3" /> Payment</>
                        ) : (
                          <><Handshake className="mr-1 h-3 w-3" /> Services</>
                        )}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">
                      ₹{lenderRepaymentProposal.amount}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {onViewRepayment && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onViewRepayment(id)}
                className="mt-2 w-full text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                View Repayment Details
              </Button>
            )}
          </div>
        )}
        
        {showNoteInput && (
          <div className="mb-4 space-y-2">
            <Textarea 
              placeholder="Add a note to the lender..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={() => setShowNoteInput(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAcceptWithNote} className="bg-green-600 hover:bg-green-700">Accept</Button>
              <Button size="sm" variant="destructive" onClick={handleDeclineWithNote}>Decline</Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            For Loan Request #{loanId.substring(0, 8)}
          </span>
          <div className="space-x-2">
            {status === 'pending' && onAccept && onDecline && onCounter && (
              <>
                <Popover open={isCounterPopoverOpen} onOpenChange={setIsCounterPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      Counter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Make Counter Offer</h4>
                      <div className="space-y-2">
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            placeholder="Amount"
                            className="pl-10"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                          />
                        </div>
                        <Textarea
                          placeholder="Add details about your counter offer..."
                          value={counterNote}
                          onChange={(e) => setCounterNote(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setIsCounterPopoverOpen(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleCounterOffer}>
                          Send Counter
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowNoteInput(true)}
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  With Note
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDecline(id)}
                >
                  Decline
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => onAccept(id)}
                >
                  Accept
                </Button>
              </>
            )}
            
            {/* Add counter offer buttons for lender side */}
            {status === 'counter' && isLender && onAccept && onDecline && onCounter && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(loanId)}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDecline(id)}
                >
                  Decline
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      Counter Again
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Make Counter Offer</h4>
                      <div className="space-y-2">
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            placeholder="Amount"
                            className="pl-10"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                          />
                        </div>
                        <Textarea
                          placeholder="Add details about your counter offer..."
                          value={counterNote}
                          onChange={(e) => setCounterNote(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setIsCounterPopoverOpen(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleCounterOffer}>
                          Send Counter
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button 
                  size="sm" 
                  onClick={() => onAccept(id)}
                >
                  Accept
                </Button>
              </>
            )}
            
            {status === 'accepted' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewDetails(loanId)}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfferCard;
