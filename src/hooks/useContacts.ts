
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserContacts } from '@/utils/messageUtils';

export function useContacts() {
  const { user } = useAuth();
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
        setContacts(contactsData);
      } catch (err) {
        console.error('Error loading contacts:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    loadContacts();
  }, [user]);
  
  return { contacts, loading, error };
}
