'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { IndianRupee } from 'lucide-react';
import CounterOffersList from './CounterOffersList';
import CounterOfferForm from './CounterOfferForm';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

interface ProductOffer {
    id: string;
    title: string;
    description: string;
    specifications: string;
    age: string;
    amount: number;
    image_url: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    borrower_id: string;
    category: {
        name: string;
    };
    counter_offers: {
        id: string;
        amount: number;
        message: string | null;
        status: 'pending' | 'accepted' | 'rejected';
        created_at: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatar: string | null;
        };
    }[];
}

interface ProductOfferDetailsProps {
    productOffer: ProductOffer;
    onCounterOffer?: () => void;
}

const ProductOfferDetails = ({ productOffer, onCounterOffer }: ProductOfferDetailsProps) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [showCounterOfferForm, setShowCounterOfferForm] = React.useState(false);

    const handleCounterOfferSuccess = () => {
        setShowCounterOfferForm(false);
        toast({
            title: "Success",
            description: "Counter offer submitted successfully",
        });
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>{productOffer.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Category</p>
                            <p>{productOffer.category.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Age</p>
                            <p>{productOffer.age}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Amount</p>
                            <div className="flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                <span>{productOffer.amount}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <p className="capitalize">{productOffer.status}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="mt-1">{productOffer.description}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500">Specifications</p>
                        <p className="mt-1">{productOffer.specifications}</p>
                    </div>

                    {productOffer.image_url && (
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Product Image</p>
                            <img
                                src={productOffer.image_url}
                                alt={productOffer.title}
                                className="rounded-lg max-w-full h-auto"
                            />
                        </div>
                    )}

                    {user && user.id !== productOffer.borrower_id && productOffer.status === 'pending' && (
                        <div className="mt-4">
                            <Button onClick={onCounterOffer}>
                                Make Counter Offer
                            </Button>
                        </div>
                    )}

                    {/* Counter Offers */}
                    {productOffer.counter_offers && productOffer.counter_offers.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium mb-4">Counter Offers</h3>
                            <div className="space-y-4">
                                {productOffer.counter_offers.map((counter) => (
                                    <div key={counter.id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{counter.user.name}</p>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                Counter Offer
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Made {format(new Date(counter.created_at), 'PPP p')}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <IndianRupee className="h-4 w-4" />
                                            <span className="font-medium">{counter.amount}</span>
                                        </div>
                                        {counter.message && (
                                            <p className="mt-2 text-sm text-gray-600">{counter.message}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductOfferDetails; 