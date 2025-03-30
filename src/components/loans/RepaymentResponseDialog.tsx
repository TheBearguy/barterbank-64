
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, CreditCard, Handshake, IndianRupee, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface RepaymentResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    id: string;
    borrower_repayment_proposal: any;
    repayment_status: string;
  };
  onResponseSent: () => void;
}

const responseSchema = z.object({
  action: z.enum(['accept', 'counter', 'reject']),
  method: z.enum(['payment', 'services']).optional(),
  amount: z.string().optional().refine(val => !val || (parseFloat(val) > 0), {
    message: "Amount must be a positive number",
  }),
  paymentDetails: z.string().optional(),
  services: z.string().optional(),
  message: z.string().min(1, "Please provide a response message"),
});

type ResponseFormValues = z.infer<typeof responseSchema>;

const RepaymentResponseDialog: React.FC<RepaymentResponseDialogProps> = ({ 
  isOpen, 
  onClose,
  offer,
  onResponseSent
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const proposal = offer.borrower_repayment_proposal;

  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      action: 'accept',
      method: proposal?.method || 'payment',
      amount: proposal?.amount?.toString() || '',
      paymentDetails: '',
      services: '',
      message: '',
    },
  });

  const selectedAction = form.watch('action');
  const selectedMethod = form.watch('method');

  const onSubmit = async (values: ResponseFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (values.action === 'accept') {
        // Accept the proposal
        const { error } = await supabase
          .from('offers')
          .update({
            repayment_status: 'accepted'
          })
          .eq('id', offer.id);
        
        if (error) throw error;
        
        toast({
          title: "Proposal accepted",
          description: "You have accepted the borrower's repayment proposal",
        });
      } else if (values.action === 'reject') {
        // Reject the proposal
        const { error } = await supabase
          .from('offers')
          .update({
            repayment_status: 'rejected'
          })
          .eq('id', offer.id);
        
        if (error) throw error;
        
        toast({
          title: "Proposal rejected",
          description: "You have rejected the borrower's repayment proposal",
        });
      } else if (values.action === 'counter') {
        // Format counter proposal data
        const counterProposalData = {
          method: values.method,
          amount: parseFloat(values.amount || '0'),
          details: values.method === 'payment' ? values.paymentDetails : values.services,
          message: values.message,
          proposed_at: new Date().toISOString(),
        };
        
        // Send counter proposal
        const { error } = await supabase
          .from('offers')
          .update({
            lender_repayment_proposal: counterProposalData,
            repayment_status: 'counter'
          })
          .eq('id', offer.id);
        
        if (error) throw error;
        
        toast({
          title: "Counter proposal sent",
          description: "Your counter proposal has been sent to the borrower",
        });
      }
      
      onResponseSent();
      onClose();
    } catch (error: any) {
      console.error('Error responding to repayment proposal:', error);
      toast({
        title: "Error",
        description: `Failed to send response: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Repayment Proposal</DialogTitle>
          <DialogDescription>
            Review and respond to the borrower's repayment proposal
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-6 border rounded-md p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Borrower's Proposal</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Method:</span>
              <Badge variant="outline" className="capitalize">
                {proposal?.method === 'payment' ? (
                  <><CreditCard className="mr-1 h-3 w-3" /> Payment</>
                ) : (
                  <><Handshake className="mr-1 h-3 w-3" /> Services</>
                )}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Amount:</span>
              <span className="font-medium">₹{proposal?.amount}</span>
            </div>
            {proposal?.details && (
              <div>
                <span className="text-sm text-gray-500 block">Details:</span>
                <p className="text-sm mt-1 bg-white p-2 rounded border">{proposal.details}</p>
              </div>
            )}
            {proposal?.message && (
              <div>
                <span className="text-sm text-gray-500 block">Message:</span>
                <p className="text-sm mt-1 bg-white p-2 rounded border">{proposal.message}</p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Proposed on:</span>
              <span className="text-sm">{new Date(proposal?.proposed_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Your Response</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="accept" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          Accept Proposal
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="counter" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <Handshake className="mr-2 h-4 w-4 text-amber-500" />
                          Make Counter Proposal
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="reject" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center">
                          <X className="mr-2 h-4 w-4 text-red-500" />
                          Reject Proposal
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedAction === 'counter' && (
              <>
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Preferred Repayment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="payment" />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Direct Payment
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="services" />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center">
                              <Handshake className="mr-2 h-4 w-4" />
                              Request Services
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {selectedMethod === 'payment' && (
                  <FormField
                    control={form.control}
                    name="paymentDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            placeholder="Provide preferred payment method details"
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {selectedMethod === 'services' && (
                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services Requested</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            placeholder="Describe the services you would like as repayment"
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Add a message to explain your decision"
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className={selectedAction === 'accept' ? 'bg-green-600 hover:bg-green-700' : 
                           selectedAction === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  selectedAction === 'accept' ? 'Accept Proposal' :
                  selectedAction === 'reject' ? 'Reject Proposal' : 'Send Counter Proposal'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RepaymentResponseDialog;
