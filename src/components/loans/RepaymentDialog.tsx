
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
import { CreditCard, Handshake, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RepaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loanDetails: {
    id: string;
    amount: number;
    offer_id?: string;
  };
  onRepaymentProposed: () => void;
}

const repaymentSchema = z.object({
  method: z.enum(['payment', 'services']),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  paymentDetails: z.string().optional(),
  services: z.string().optional(),
  message: z.string().min(1, "Please provide a message to the lender"),
});

type RepaymentFormValues = z.infer<typeof repaymentSchema>;

const RepaymentDialog: React.FC<RepaymentDialogProps> = ({ 
  isOpen, 
  onClose,
  loanDetails,
  onRepaymentProposed
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RepaymentFormValues>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      method: 'payment',
      amount: loanDetails.amount.toString(),
      paymentDetails: '',
      services: '',
      message: '',
    },
  });

  const selectedMethod = form.watch('method');

  const onSubmit = async (values: RepaymentFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Format proposal data based on the selected method
      const proposalData = {
        method: values.method,
        amount: parseFloat(values.amount),
        details: values.method === 'payment' ? values.paymentDetails : values.services,
        message: values.message,
        proposed_at: new Date().toISOString(),
      };
      
      // Get the offer ID associated with this loan
      let offerId = loanDetails.offer_id;
      
      if (!offerId) {
        // If no offer ID was provided, try to find the accepted offer for this loan
        const { data: offerData, error: offerError } = await supabase
          .from('offers')
          .select('id')
          .eq('loan_id', loanDetails.id)
          .eq('status', 'accepted')
          .single();
        
        if (offerError) {
          throw new Error('Could not find an accepted offer for this loan');
        }
        
        offerId = offerData.id;
      }
      
      // Update the offer with the repayment proposal
      const { error } = await supabase
        .from('offers')
        .update({
          borrower_repayment_proposal: proposalData,
          repayment_status: 'proposed'
        })
        .eq('id', offerId);
      
      if (error) throw error;
      
      toast({
        title: "Repayment proposal sent",
        description: "Your repayment proposal has been sent to the lender",
      });
      
      onRepaymentProposed();
      onClose();
    } catch (error: any) {
      console.error('Error sending repayment proposal:', error);
      toast({
        title: "Error",
        description: `Failed to send repayment proposal: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Propose Loan Repayment</DialogTitle>
          <DialogDescription>
            Choose how you would like to repay your loan of ₹{loanDetails.amount}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Repayment Method</FormLabel>
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
                          Offer Services
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
                        placeholder="Provide details about your payment method (UPI, bank transfer, etc.)"
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
                    <FormLabel>Services Offered</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Describe the services you are offering as repayment"
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Lender</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Add a message about your repayment proposal"
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
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  'Send Proposal'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RepaymentDialog;
