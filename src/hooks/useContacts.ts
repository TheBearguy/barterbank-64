
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserContacts } from '@/utils/messageUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useContacts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadContacts = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get user role from metadata
      const userRole = user.user_metadata?.role || '';
      console.log("Loading contacts with user role:", userRole);
      
      // Try to fetch contacts using Edge Function first
      try {
        const contactsData = await fetchUserContacts(user.id, userRole);
        
        if (contactsData && contactsData.length > 0) {
          console.log("Contacts loaded successfully via Edge Function:", contactsData);
          setContacts(contactsData);
        } else {
          console.warn("No contacts found via Edge Function, trying RPC function");
          
          // Try with RPC function
          const { data: rpcContacts, error: rpcError } = await supabase
            .rpc('get_user_contacts', { user_id: user.id });
            
          if (rpcError) {
            console.error("RPC function error:", rpcError);
            throw rpcError;
          }
          
          if (rpcContacts && rpcContacts.length > 0) {
            console.log("Loaded contacts via RPC function:", rpcContacts.length);
            setContacts(rpcContacts);
          } else {
            console.warn("No contacts found via RPC, trying direct query");
            
            // Fallback: Direct query based on role
            let queryBuilder = supabase.from('profiles').select('id, name');
            
            if (userRole === 'borrower') {
              queryBuilder = queryBuilder.eq('role', 'lender');
            } else if (userRole === 'lender') {
              queryBuilder = queryBuilder.eq('role', 'borrower');
            } else {
              queryBuilder = queryBuilder.neq('id', user.id);
            }
            
            const { data: profiles, error: profilesError } = await queryBuilder;
            
            if (profilesError) {
              console.error("Direct query fallback error:", profilesError);
              throw profilesError;
            }
            
            if (profiles && profiles.length > 0) {
              console.log("Loaded contacts via direct query fallback:", profiles.length);
              setContacts(profiles);
            } else {
              console.warn("No contacts found with any method");
              setContacts([]);
              toast({
                title: "No contacts found",
                description: "There are no contacts available for your account at this time.",
                variant: "default"
              });
            }
          }
        }
      } catch (edgeFunctionError) {
        console.error("Edge Function error, trying alternatives:", edgeFunctionError);
        
        // Try with RPC function
        try {
          const { data: rpcContacts, error: rpcError } = await supabase
            .rpc('get_user_contacts', { user_id: user.id });
          
          if (rpcError) {
            console.error("RPC function error:", rpcError);
            throw rpcError;
          }
          
          if (rpcContacts && rpcContacts.length > 0) {
            console.log("Loaded contacts via RPC function after Edge Function error:", rpcContacts.length);
            setContacts(rpcContacts);
            return;
          }
        } catch (rpcError) {
          console.error("RPC function failed too, trying direct query:", rpcError);
        }
        
        // Fallback: Direct query based on role
        let queryBuilder = supabase.from('profiles').select('id, name');
        
        if (userRole === 'borrower') {
          queryBuilder = queryBuilder.eq('role', 'lender');
        } else if (userRole === 'lender') {
          queryBuilder = queryBuilder.eq('role', 'borrower');
        } else {
          queryBuilder = queryBuilder.neq('id', user.id);
        }
        
        const { data: profiles, error: profilesError } = await queryBuilder;
        
        if (profilesError) {
          console.error("Direct query fallback error:", profilesError);
          throw profilesError;
        }
        
        if (profiles && profiles.length > 0) {
          console.log("Loaded contacts via direct query fallback after Edge Function error:", profiles.length);
          setContacts(profiles);
        } else {
          console.warn("No contacts found with any method");
          setContacts([]);
          toast({
            title: "No contacts found",
            description: "There are no contacts available for your account at this time.",
            variant: "default"
          });
        }
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setContacts([]);
      
      toast({
        title: "Error loading contacts",
        description: "Could not load your contacts. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);
  
  // Add a function to manually refresh contacts
  const refreshContacts = async () => {
    await loadContacts();
    return contacts;
  };
  
  return { contacts, loading, error, refreshContacts };
}
