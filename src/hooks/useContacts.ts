
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserContacts } from '@/utils/messageUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Contact {
  id: string;
  name: string;
}

export function useContacts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
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
          return;
        } else {
          console.warn("No contacts found via Edge Function, trying RPC function");
        }
      } catch (edgeFunctionError) {
        console.error("Edge Function error, trying alternatives:", edgeFunctionError);
      }
        
      // Try with RPC function
      try {
        console.log("Trying get_user_contacts RPC function");
        const { data: rpcContacts, error: rpcError } = await supabase
          .rpc('get_user_contacts', { user_id: user.id });
          
        if (rpcError) {
          console.error("RPC function error:", rpcError);
          throw rpcError;
        }
        
        if (rpcContacts && Array.isArray(rpcContacts) && rpcContacts.length > 0) {
          console.log("Loaded contacts via RPC function:", rpcContacts.length);
          setContacts(rpcContacts);
          return;
        } else {
          console.warn("No contacts found via RPC, trying role-based RPC functions");
        }
      } catch (rpcError) {
        console.error("RPC function failed, trying role-based RPC functions:", rpcError);
      }
      
      // Fallback: Use role-based RPC functions
      if (userRole === 'borrower') {
        try {
          console.log("Trying get_all_lenders RPC function for borrower");
          const { data: lenders, error: lendersError } = await supabase
            .rpc('get_all_lenders');
            
          if (lendersError) {
            console.error("Lenders RPC error:", lendersError);
            throw lendersError;
          }
          
          if (lenders && Array.isArray(lenders) && lenders.length > 0) {
            console.log("Loaded lender contacts via RPC:", lenders.length);
            setContacts(lenders);
            return;
          } else {
            console.warn("No lenders found, using empty contacts list");
            setContacts([]);
          }
        } catch (lendersError) {
          console.error("Lenders RPC failed:", lendersError);
          setContacts([]);
        }
      } else if (userRole === 'lender') {
        try {
          console.log("Trying get_all_borrowers RPC function for lender");
          const { data: borrowers, error: borrowersError } = await supabase
            .rpc('get_all_borrowers');
            
          if (borrowersError) {
            console.error("Borrowers RPC error:", borrowersError);
            throw borrowersError;
          }
          
          if (borrowers && Array.isArray(borrowers) && borrowers.length > 0) {
            console.log("Loaded borrower contacts via RPC:", borrowers.length);
            setContacts(borrowers);
            return;
          } else {
            console.warn("No borrowers found, using empty contacts list");
            setContacts([]);
          }
        } catch (borrowersError) {
          console.error("Borrowers RPC failed:", borrowersError);
          setContacts([]);
        }
      } else {
        try {
          console.log("Trying get_all_users_except RPC function");
          const { data: allUsers, error: allUsersError } = await supabase
            .rpc('get_all_users_except', { exclude_id: user.id });
            
          if (allUsersError) {
            console.error("All users RPC error:", allUsersError);
            throw allUsersError;
          }
          
          if (allUsers && Array.isArray(allUsers) && allUsers.length > 0) {
            console.log("Loaded all users as contacts via RPC:", allUsers.length);
            setContacts(allUsers);
            return;
          } else {
            console.warn("No users found, using empty contacts list");
            setContacts([]);
          }
        } catch (allUsersError) {
          console.error("All users RPC failed:", allUsersError);
          setContacts([]);
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
