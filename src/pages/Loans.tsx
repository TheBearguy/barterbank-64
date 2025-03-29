
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Search, SlidersHorizontal, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLoansData } from '@/hooks/useLoansData';

const Loans = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAmount, setFilterAmount] = useState('all');
  const { availableLoans, loading } = useLoansData();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect borrowers to their offers page
  useEffect(() => {
    if (isAuthenticated && user?.user_metadata?.role === 'borrower') {
      navigate('/offers');
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const filteredLoans = availableLoans
    .filter(loan => {
      if (filterAmount === 'all') return true;
      if (filterAmount === 'under2k') return parseFloat(loan.amount.toString()) < 2000;
      if (filterAmount === '2kto5k') return parseFloat(loan.amount.toString()) >= 2000 && parseFloat(loan.amount.toString()) <= 5000;
      if (filterAmount === 'over5k') return parseFloat(loan.amount.toString()) > 5000;
      return true;
    })
    .filter(loan => {
      if (!searchTerm) return true;
      return (
        loan.borrower?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-grow py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Loan Requests</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Browse active loan requests where you can offer help
              </p>
            </div>
            
            {isAuthenticated && user?.user_metadata?.role === 'borrower' && (
              <Link to="/create-loan" className="mt-4 md:mt-0">
                <Button className="button-shine">
                  <span>Create Loan Request</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-subtle p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name or description..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                <Select value={filterAmount} onValueChange={setFilterAmount}>
                  <SelectTrigger className="w-[180px]">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amounts</SelectItem>
                    <SelectItem value="under2k">Under ₹2,000</SelectItem>
                    <SelectItem value="2kto5k">₹2,000 - ₹5,000</SelectItem>
                    <SelectItem value="over5k">Over ₹5,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="recent">Recently Added</TabsTrigger>
              <TabsTrigger value="popular">Most Offers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading loan requests...</p>
                </div>
              ) : filteredLoans.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredLoans.map(loan => (
                    <Card key={loan.id} className="overflow-hidden hover:shadow-elevation transition-shadow">
                      <CardHeader className="pb-2 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              ₹{loan.amount}
                              <span className="ml-4 text-sm font-normal text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(loan.created_at).toLocaleDateString()}
                              </span>
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {loan.description}
                            </CardDescription>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                            {loan.status}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex items-center mb-4 md:mb-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                              {loan.borrower?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium">{loan.borrower?.name || 'Unknown'}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex gap-3">
                              <Link to={`/loans/${loan.id}`}>
                                <Button variant="outline" size="sm">View Details</Button>
                              </Link>
                              {isAuthenticated && user?.user_metadata?.role === 'lender' && (
                                <Link to={`/loans/${loan.id}`}>
                                  <Button size="sm">Make Offer</Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No loan requests found matching your criteria</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent">
              <div className="grid grid-cols-1 gap-6">
                {filteredLoans
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 3)
                  .map(loan => (
                    <Card key={loan.id} className="overflow-hidden hover:shadow-elevation transition-shadow">
                      {/* Similar card content as above */}
                      <CardHeader className="pb-2 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              ₹{loan.amount}
                              <span className="ml-4 text-sm font-normal text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(loan.created_at).toLocaleDateString()}
                              </span>
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {loan.description}
                            </CardDescription>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                            {loan.status}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex items-center mb-4 md:mb-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                              {loan.borrower?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium">{loan.borrower?.name || 'Unknown'}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex gap-3">
                              <Link to={`/loans/${loan.id}`}>
                                <Button variant="outline" size="sm">View Details</Button>
                              </Link>
                              {isAuthenticated && user?.user_metadata?.role === 'lender' && (
                                <Link to={`/loans/${loan.id}`}>
                                  <Button size="sm">Make Offer</Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="popular">
              <div className="text-center py-12">
                <p className="text-gray-500">Coming soon - popularity ranking based on offer count</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Loans;
