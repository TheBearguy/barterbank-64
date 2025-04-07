
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceAdded: () => void;
}

const AddServiceModal = ({ open, onOpenChange, onServiceAdded }: AddServiceModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceName.trim()) {
      toast({
        title: "Error",
        description: "Service name is required",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a service",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create a loan record first with a valid status value (using 'pending' instead of 'service')
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .insert({
          borrower_id: user.id,
          amount: parseFloat(value) || 0,
          description: description || serviceName,
          status: 'pending' // Using a valid status value that exists in the database schema
        })
        .select()
        .single();

      if (loanError) throw loanError;

      console.log("Created loan:", loan);

      // Now create the service linked to this loan
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          name: serviceName,
          loan_id: loan.id,
          created_at: new Date().toISOString()
        })
        .select();

      if (serviceError) throw serviceError;

      console.log("Created service:", service);

      toast({
        title: "Success",
        description: "Service added successfully"
      });
      
      // Reset form and close modal
      setServiceName('');
      setDescription('');
      setValue('');
      onOpenChange(false);
      
      // Notify parent component to refresh the services list
      onServiceAdded();
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., Web Development"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you offer..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Value (₹)</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;
