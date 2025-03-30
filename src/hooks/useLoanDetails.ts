
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loan, Offer } from './useLoansData';

export function useLoanDetails(loanId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      if (!loanId || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch the loan details
        const { data: loanData, error: loanError } = await supabase
          .from('loans')
          .select(`
            *,
            borrower:profiles!borrower_id(name, id),
            lender:profiles!lender_id(name, id)
          `)
          .eq('id', loanId)
          .single();
        
        if (loanError) throw loanError;
        setLoan(loanData);
        
        // Fetch offers for this loan, including repayment information
        const { data: offerData, error: offerError } = await supabase
          .from('offers')
          .select(`
            *,
            lender:profiles!lender_id(name, id)
          `)
          .eq('loan_id', loanId);
          
        if (offerError) throw offerError;
        setOffers(offerData || []);
        
      } catch (error: any) {
        console.error('Error fetching loan details:', error);
        setError(error.message);
        toast({
          title: 'Error',
          description: 'Failed to load loan details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanDetails();
  }, [loanId, user, toast]);
  
  return { loan, offers, loading, error };
}
