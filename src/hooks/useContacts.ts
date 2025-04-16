
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
      
      // First try to use the Edge Function
      const contactsData = await fetchUserContacts(user.id, userRole);
      
      console.log("Contacts loaded:", contactsData);
      
      // If contacts were successfully loaded
      if (contactsData && contactsData.length > 0) {
        setContacts(contactsData);
      } else {
        console.warn("No contacts found from primary source, attempting direct query");
        
        // Try a direct database query as fallback
        try {
          // Query based on user role - borrowers see lenders, lenders see borrowers
          let { data, error } = userRole === 'borrower' 
            ? await supabase.from('profiles').select('id, name').eq('role', 'lender')
            : await supabase.from('profiles').select('id, name').eq('role', 'borrower');
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            const formattedContacts = data.map(profile => ({
              id: profile.id,
              name: profile.name || 'Unknown User'
            }));
            
            console.log("Contacts loaded from database:", formattedContacts);
            setContacts(formattedContacts);
          } else {
            // Fall back to mock contacts
            console.warn("No contacts found in direct query");
            showMockContactsMessage();
          }
        } catch (dbError) {
          console.error("Database query failed:", dbError);
          showMockContactsMessage();
        }
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Add mock contacts as fallback on error
      showMockContactsMessage();
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  const showMockContactsMessage = () => {
    // Add mock contacts as fallback
    const mockContacts = [
      { id: "mock-user-1", name: "Test User 1" },
      { id: "mock-user-2", name: "Test User 2" },
      { id: "mock-user-3", name: "Test User 3" }
    ];
    
    setContacts(mockContacts);
    
    toast({
      title: "Using demo contacts",
      description: "Couldn't fetch your contacts. Using demo contacts for now.",
      variant: "default"
    });
  };
  
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
