
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
          
          if (rpcContacts && Array.isArray(rpcContacts) && rpcContacts.length > 0) {
            console.log("Loaded contacts via RPC function:", rpcContacts.length);
            setContacts(rpcContacts);
          } else {
            console.warn("No contacts found via RPC, trying role-based filtering");
            
            // Fallback: Use profiles based on role
            if (userRole === 'borrower') {
              const { data: lenders, error: lendersError } = await supabase
                .rpc('get_all_lenders');
                
              if (lendersError) {
                console.error("Lenders query error:", lendersError);
                throw lendersError;
              }
              
              if (lenders && Array.isArray(lenders) && lenders.length > 0) {
                console.log("Loaded lender contacts:", lenders.length);
                setContacts(lenders);
              } else {
                setContacts([]);
              }
            } else if (userRole === 'lender') {
              const { data: borrowers, error: borrowersError } = await supabase
                .rpc('get_all_borrowers');
                
              if (borrowersError) {
                console.error("Borrowers query error:", borrowersError);
                throw borrowersError;
              }
              
              if (borrowers && Array.isArray(borrowers) && borrowers.length > 0) {
                console.log("Loaded borrower contacts:", borrowers.length);
                setContacts(borrowers);
              } else {
                setContacts([]);
              }
            } else {
              const { data: allUsers, error: allUsersError } = await supabase
                .rpc('get_all_users_except', { exclude_id: user.id });
                
              if (allUsersError) {
                console.error("All users query error:", allUsersError);
                throw allUsersError;
              }
              
              if (allUsers && Array.isArray(allUsers) && allUsers.length > 0) {
                console.log("Loaded all users as contacts:", allUsers.length);
                setContacts(allUsers);
              } else {
                setContacts([]);
              }
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
          
          if (rpcContacts && Array.isArray(rpcContacts) && rpcContacts.length > 0) {
            console.log("Loaded contacts via RPC function after Edge Function error:", rpcContacts.length);
            setContacts(rpcContacts);
            return;
          }
        } catch (rpcError) {
          console.error("RPC function failed too, trying role-based filtering:", rpcError);
        }
        
        // Fallback: Use profiles based on role
        if (userRole === 'borrower') {
          const { data: lenders, error: lendersError } = await supabase
            .rpc('get_all_lenders');
            
          if (lendersError) {
            console.error("Lenders query error:", lendersError);
            throw lendersError;
          }
          
          if (lenders && Array.isArray(lenders) && lenders.length > 0) {
            console.log("Loaded lender contacts after failures:", lenders.length);
            setContacts(lenders);
          } else {
            setContacts([]);
          }
        } else if (userRole === 'lender') {
          const { data: borrowers, error: borrowersError } = await supabase
            .rpc('get_all_borrowers');
            
          if (borrowersError) {
            console.error("Borrowers query error:", borrowersError);
            throw borrowersError;
          }
          
          if (borrowers && Array.isArray(borrowers) && borrowers.length > 0) {
            console.log("Loaded borrower contacts after failures:", borrowers.length);
            setContacts(borrowers);
          } else {
            setContacts([]);
          }
        } else {
          const { data: allUsers, error: allUsersError } = await supabase
            .rpc('get_all_users_except', { exclude_id: user.id });
            
          if (allUsersError) {
            console.error("All users query error:", allUsersError);
            throw allUsersError;
          }
          
          if (allUsers && Array.isArray(allUsers) && allUsers.length > 0) {
            console.log("Loaded all users as contacts after failures:", allUsers.length);
            setContacts(allUsers);
          } else {
            setContacts([]);
          }
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
