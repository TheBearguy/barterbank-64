'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { IndianRupee } from 'lucide-react';
import CounterOffersList from '@/components/loans/CounterOffersList';
import CounterOfferForm from '@/components/loans/CounterOfferForm';

interface ProductOffer {
    id: string;
    title: string;
    description: string;
    specifications: string;
    age: string;
    amount: number;
    image_url: string;
    status: string;
    borrower_id: string;
    loan_id: string;
    category: {
        name: string;
    };
}

const ProductOfferDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [offer, setOffer] = useState<ProductOffer | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isBorrower, setIsBorrower] = useState(false);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/login');
                    return;
                }
                setCurrentUserId(user.id);

                const { data, error } = await supabase
                    .from('product_offers')
                    .select(`
                        *,
                        category:product_categories(name)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                setOffer(data);
                setIsBorrower(data.borrower_id === user.id);
            } catch (error) {
                console.error('Error fetching product offer:', error);
                toast({
                    title: "Error",
                    description: "Failed to load product offer details",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOffer();
    }, [id, navigate, toast]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!offer) {
        return <div>Product offer not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-6"
            >
                Back
            </Button>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Title</h3>
                                <p>{offer.title}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold">Category</h3>
                                <p>{offer.category.name}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold">Description</h3>
                                <p>{offer.description}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold">Specifications</h3>
                                <p>{offer.specifications}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold">Age</h3>
                                <p>{offer.age}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold">Amount</h3>
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="h-4 w-4" />
                                    <span>{offer.amount}</span>
                                </div>
                            </div>

                            {offer.image_url && (
                                <div>
                                    <h3 className="font-semibold">Image</h3>
                                    <img
                                        src={offer.image_url}
                                        alt={offer.title}
                                        className="mt-2 rounded-lg max-w-full h-auto"
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {offer.status === 'pending' && !isBorrower && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Make a Counter Offer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CounterOfferForm
                                    productOfferId={offer.id}
                                    currentUserId={currentUserId!}
                                    onSuccess={() => {
                                        // Refresh the page or update the state
                                        window.location.reload();
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    <CounterOffersList
                        productOfferId={offer.id}
                        currentUserId={currentUserId!}
                        isBorrower={isBorrower}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductOfferDetails; 