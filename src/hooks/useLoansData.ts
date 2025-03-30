
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
  borrower_note?: string;
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

        if (userRole === 'borrower') {
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
        } else if (userRole === 'lender') {
          const { data: loans, error: loansError } = await supabase
            .from('loans')
            .select(`
              *,
              borrower:profiles!borrower_id(name, id)
            `)
            .eq('status', 'pending');

          if (loansError) throw loansError;
          setAvailableLoans(loans || []);

          // Fixed query for lender's offers
          const { data: offers, error: offersError } = await supabase
            .from('offers')
            .select(`
              *,
              loan:loans(id, borrower_id, amount, status, description)
            `)
            .eq('lender_id', user.id);

          if (offersError) throw offersError;
          
          // If we need borrower information for each loan, fetch it separately
          const offersWithBorrowers = await Promise.all((offers || []).map(async (offer) => {
            if (offer.loan && offer.loan.borrower_id) {
              const { data: borrowerData } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', offer.loan.borrower_id)
                .single();
                
              return {
                ...offer,
                borrower: borrowerData
              };
            }
            return offer;
          }));
          
          setMadeOffers(offersWithBorrowers || []);
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

  const updateOfferStatus = async (offerId: string, status: 'accepted' | 'rejected' | 'counter', borrowerNote?: string) => {
    try {
      console.log(`Updating offer ${offerId} to status: ${status}`);
      
      const updateData: { status: string; borrower_note?: string } = { status };
      if (borrowerNote) {
        updateData.borrower_note = borrowerNote;
      }
      
      const { error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', offerId);

      if (error) throw error;

      if (status === 'accepted') {
        const { data: offerData } = await supabase
          .from('offers')
          .select('loan_id, lender_id')
          .eq('id', offerId)
          .single();

        if (offerData) {
          console.log(`Updating loan ${offerData.loan_id} to active with lender ${offerData.lender_id}`);
          
          const { error: loanError } = await supabase
            .from('loans')
            .update({ 
              status: 'active',
              lender_id: offerData.lender_id
            })
            .eq('id', offerData.loan_id);

          if (loanError) {
            console.error("Error updating loan:", loanError);
            throw loanError;
          }
          
          const { error: rejectError } = await supabase
            .from('offers')
            .update({ status: 'rejected' })
            .eq('loan_id', offerData.loan_id)
            .neq('id', offerId);
            
          if (rejectError) {
            console.error("Error rejecting other offers:", rejectError);
          }
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
