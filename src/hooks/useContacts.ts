
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserContacts } from '@/utils/messageUtils';
import { useToast } from '@/hooks/use-toast';

export function useContacts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadContacts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get user role from metadata
        const userRole = user.user_metadata?.role || '';
        console.log("Loading contacts with user role:", userRole);
        
        const contactsData = await fetchUserContacts(user.id, userRole);
        
        console.log("Contacts loaded:", contactsData);
        setContacts(contactsData);
        
        // Show error toast if no contacts were found
        if (contactsData.length === 0) {
          console.warn("No contacts found for user");
          toast({
            title: "No contacts found",
            description: "Using mock contacts for demonstration purposes.",
            variant: "default"
          });
          
          // Add mock contacts as fallback
          setContacts([
            { id: "mock-user-1", name: "Test User 1" },
            { id: "mock-user-2", name: "Test User 2" }
          ]);
        }
      } catch (err) {
        console.error('Error loading contacts:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        
        // Add mock contacts as fallback on error
        setContacts([
          { id: "mock-user-1", name: "Test User 1" },
          { id: "mock-user-2", name: "Test User 2" }
        ]);
        
        toast({
          title: "Error",
          description: "Failed to load contacts. Using mock contacts instead.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadContacts();
  }, [user, toast]);
  
  // Add a function to manually refresh contacts
  const refreshContacts = async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      setError(null);
      const userRole = user.user_metadata?.role || '';
      const contactsData = await fetchUserContacts(user.id, userRole);
      setContacts(contactsData);
      return contactsData;
    } catch (err) {
      console.error('Error refreshing contacts:', err);
      
      // Return mock contacts on error
      const mockContacts = [
        { id: "mock-user-1", name: "Test User 1" },
        { id: "mock-user-2", name: "Test User 2" }
      ];
      
      setContacts(mockContacts);
      return mockContacts;
    } finally {
      setLoading(false);
    }
  };
  
  return { contacts, loading, error, refreshContacts };
}
