
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAvailableContacts, Contact } from '@/utils/messageUtils';
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
      
      // Use the RPC function to get contacts based on role
      const contactsData = await fetchAvailableContacts(user.id);
      
      if (contactsData && contactsData.length > 0) {
        console.log("Contacts loaded successfully:", contactsData);
        setContacts(contactsData);
      } else {
        console.warn("No contacts found via RPC, using fallback method");
        
        // Add a fallback to get all profiles if no contacts were found through RPC
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role')
          .neq('id', user.id);
          
        if (error) {
          console.error('Fallback profiles query error:', error);
          throw new Error('Failed to load contacts via fallback method');
        } else if (data && data.length > 0) {
          console.log("Fallback profiles found:", data);
          setContacts(data);
        } else {
          console.warn("No profiles found in fallback query either");
          setContacts([]);
        }
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
