
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Plus, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const CreateLoan = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [currentService, setCurrentService] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in or not a borrower
  if (!isAuthenticated || user?.role !== 'borrower') {
    return <Navigate to="/login" replace />;
  }

  const handleAddService = () => {
    if (currentService.trim() && !services.includes(currentService.trim())) {
      setServices([...services, currentService.trim()]);
      setCurrentService('');
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter(service => service !== serviceToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid loan amount",
        variant: "destructive",
      });
      return;
    }

    if (!description) {
      toast({
        title: "Description required",
        description: "Please provide a description for your loan request",
        variant: "destructive",
      });
      return;
    }

    if (services.length === 0) {
      toast({
        title: "Services required",
        description: "Please add at least one service or product you can offer",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Loan request created",
        description: "Your loan request has been successfully created",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Failed to create loan request",
        description: "An error occurred while creating your loan request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create Loan Request</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Specify how much you need and what services or products you can offer in return
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>
                Fill out the information for your loan request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount in rupees"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain why you need this loan and how you plan to use it"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Services or Products You Can Offer</Label>
                  <div className="flex">
                    <Input
                      value={currentService}
                      onChange={(e) => setCurrentService(e.target.value)}
                      placeholder="e.g., Web Development, Home Cooking, Tutoring..."
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddService} 
                      className="ml-2" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {services.map((service, index) => (
                      <div 
                        key={index} 
                        className="flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-sm"
                      >
                        <span>{service}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveService(service)} 
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Add the services or products you can provide as partial or full repayment
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end space-x-4">
                  <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="button-shine">
                    {loading ? 'Creating...' : 'Create Loan Request'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateLoan;
