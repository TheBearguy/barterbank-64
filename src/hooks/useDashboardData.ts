
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Loan {
  id: string;
  amount: number;
  status: string;
  requestDate: string;
  offersCount: number;
}

export interface Offer {
  id: string;
  amount: number;
  status: string;
  offerDate: string;
  loanId: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  value: number;
  loanId: string;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableLoans, setAvailableLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger a refresh of the data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user) {
          // Fetch services with their associated loans
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select(`
              id,
              name,
              loan_id,
              loans (
                id,
                amount,
                description
              )
            `)
            .eq('loans.borrower_id', user.id)
            .order('created_at', { ascending: false });

          if (servicesError) {
            console.error("Error fetching services:", servicesError);
            throw servicesError;
          }

          // Transform services data to match our interface
          const formattedServices = servicesData.map(service => ({
            id: service.id,
            title: service.name,
            description: service.loans?.description || '',
            value: service.loans?.amount || 0,
            loanId: service.loan_id
          }));

          setServices(formattedServices);
          console.log("Fetched services:", formattedServices);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, refreshTrigger]);

  return {
    userLoans,
    offers,
    services,
    availableLoans,
    loading,
    refreshData
  };
}
