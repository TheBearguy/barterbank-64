
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAvailableContacts, fetchUserContacts, Contact } from '@/utils/messageUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        
      // Fallback to RPC function
      try {
        console.log("Trying get_available_contacts RPC function");
        const contacts = await fetchAvailableContacts(user.id);
        
        if (contacts && contacts.length > 0) {
          console.log("Loaded contacts via RPC function:", contacts.length);
          setContacts(contacts);
          return;
        } else {
          console.warn("No contacts found via RPC, using empty contacts list");
          setContacts([]);
        }
      } catch (rpcError) {
        console.error("RPC function failed:", rpcError);
        setContacts([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error loading contacts:', errorMessage);
      setError(errorMessage);
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
