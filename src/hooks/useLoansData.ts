
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Loan {
  id: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  borrower_id: string;
  borrower?: {
    name: string;
    id: string;
  };
  offersCount?: number;
}

export interface Offer {
  id: string;
  loan_id: string;
  lender_id: string;
  amount: number;
  status: string;
  message: string;
  created_at: string;
  updated_at: string;
  lender?: {
    name: string;
  };
}

export function useLoansData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [availableLoans, setAvailableLoans] = useState<Loan[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [madeOffers, setMadeOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userRole = user?.user_metadata?.role;

        // If user is a borrower, fetch their loans and any offers on those loans
        if (userRole === 'borrower') {
          // Fetch loans created by this borrower
          const { data: loans, error: loansError } = await supabase
            .from('loans')
            .select(`
              *,
              borrower:profiles!borrower_id(name, id)
            `)
            .eq('borrower_id', user.id);

          if (loansError) throw loansError;
          
          setUserLoans(loans || []);

          if (loans && loans.length > 0) {
            // Fetch offers made on the borrower's loans
            const loanIds = loans.map(loan => loan.id);
            const { data: offers, error: offersError } = await supabase
              .from('offers')
              .select(`
                *,
                lender:profiles!lender_id(name)
              `)
              .in('loan_id', loanIds);

            if (offersError) throw offersError;
            setReceivedOffers(offers || []);
          }
        } 
        // If user is a lender, fetch available loans and their offers
        else if (userRole === 'lender') {
          // Fetch all available loans
          const { data: loans, error: loansError } = await supabase
            .from('loans')
            .select(`
              *,
              borrower:profiles!borrower_id(name, id)
            `)
            .eq('status', 'pending');

          if (loansError) throw loansError;
          setAvailableLoans(loans || []);

          // Fetch offers made by this lender
          const { data: offers, error: offersError } = await supabase
            .from('offers')
            .select(`
              *,
              loans!inner(id, borrower_id, amount, status, description),
              profiles!loans(name)
            `)
            .eq('lender_id', user.id);

          if (offersError) throw offersError;
          setMadeOffers(offers || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load loan and offer data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, toast]);

  const createLoanOffer = async (loanId: string, amount: number, message: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('offers')
        .insert({
          loan_id: loanId,
          lender_id: user.id,
          amount: amount,
          message: message,
          status: 'pending'
        })
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create loan offer',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateOfferStatus = async (offerId: string, status: 'accepted' | 'rejected' | 'counter') => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status })
        .eq('id', offerId);

      if (error) throw error;

      // If offer is accepted, update loan status
      if (status === 'accepted') {
        // Find the offer to get the loan_id and lender_id
        const { data: offerData } = await supabase
          .from('offers')
          .select('loan_id, lender_id')
          .eq('id', offerId)
          .single();

        if (offerData) {
          // Update the loan status and lender_id
          const { error: loanError } = await supabase
            .from('loans')
            .update({ 
              status: 'active',
              lender_id: offerData.lender_id
            })
            .eq('id', offerData.loan_id);

          if (loanError) throw loanError;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating offer status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update offer status',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    userLoans,
    availableLoans,
    receivedOffers,
    madeOffers,
    loading,
    createLoanOffer,
    updateOfferStatus
  };
}
