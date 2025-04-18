import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loan, Offer } from './useLoansData';

interface ProductOffer {
  id: string;
  loan_id: string;
  borrower_id: string;
  category_id: string;
  title: string;
  description: string;
  specifications: string;
  age: string;
  amount: number;
  image_url: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  borrower: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  };
  category: {
    name: string;
  };
  counter_offers: {
    id: string;
    amount: number;
    message: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar: string | null;
    };
  }[];
}

export function useLoanDetails(loanId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [productOffers, setProductOffers] = useState<ProductOffer[]>([]);
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
        
        // Fetch product offers and their counter offers
        const { data: productOffersData, error: productOffersError } = await supabase
          .from('product_offers')
          .select(`
            *,
            borrower:profiles!borrower_id(id, name, email, role, avatar),
            category:product_categories(name)
          `)
          .eq('loan_id', loanId)
          .order('created_at', { ascending: false });
          
        if (productOffersError) throw productOffersError;
        
        // Fetch counter offers for all product offers
        const { data: counterOffersData, error: counterOffersError } = await supabase
          .from('counter_offers')
          .select(`
            *,
            user:profiles!user_id(id, name, email, role, avatar)
          `)
          .in('product_offer_id', productOffersData?.map(offer => offer.id) || [])
          .order('created_at', { ascending: false });
          
        if (counterOffersError) throw counterOffersError;
        
        // Combine product offers with their counter offers
        const productOffersWithCounterOffers = productOffersData?.map(offer => ({
          ...offer,
          counter_offers: counterOffersData?.filter(counter => counter.product_offer_id === offer.id) || []
        })) || [];
        
        setProductOffers(productOffersWithCounterOffers);
        
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
  
  return { loan, offers, productOffers, loading, error };
}
