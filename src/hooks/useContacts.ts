
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserContacts } from '@/utils/messageUtils';
import { useToast } from '@/hooks/use-toast';

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
      
      if (!userRole) {
        throw new Error("User role not found in metadata");
      }
      
      // Fetch contacts based on role - uses the Edge Function which handles the role-based filtering
      const contactsData = await fetchUserContacts(user.id, userRole);
      
      if (contactsData && contactsData.length > 0) {
        console.log("Contacts loaded successfully:", contactsData);
        setContacts(contactsData);
      } else {
        console.warn("No contacts found, showing mock contacts");
        showMockContactsMessage();
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
