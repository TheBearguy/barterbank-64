
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
      
      // Fetch contacts based on role
      const contactsData = await fetchUserContacts(user.id, userRole);
      
      if (contactsData && contactsData.length > 0) {
        console.log("Contacts loaded successfully:", contactsData);
        setContacts(contactsData);
      } else {
        console.warn("No contacts found");
        setContacts([]);
        toast({
          title: "No contacts found",
          description: "There are no contacts available for your account at this time.",
          variant: "default"
        });
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
