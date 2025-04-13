
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
            description: "Couldn't find any contacts for your account.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error loading contacts:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
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
    if (!user) return;
    
    try {
      setLoading(true);
      const userRole = user.user_metadata?.role || '';
      const contactsData = await fetchUserContacts(user.id, userRole);
      setContacts(contactsData);
      return contactsData;
    } catch (err) {
      console.error('Error refreshing contacts:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { contacts, loading, error, refreshContacts };
}
