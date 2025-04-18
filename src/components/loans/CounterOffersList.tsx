'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { IndianRupee } from 'lucide-react';

interface CounterOffer {
    id: string;
    amount: number;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    user_id: string;
}

interface CounterOffersListProps {
    productOfferId: string;
    currentUserId: string;
    isBorrower: boolean;
}

const CounterOffersList = ({ productOfferId, currentUserId, isBorrower }: CounterOffersListProps) => {
    const { toast } = useToast();
    const [counterOffers, setCounterOffers] = useState<CounterOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounterOffers = async () => {
            try {
                const { data, error } = await supabase
                    .from('counter_offers')
                    .select('*')
                    .eq('product_offer_id', productOfferId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCounterOffers(data || []);
            } catch (error) {
                console.error('Error fetching counter offers:', error);
                toast({
                    title: "Error",
                    description: "Failed to load counter offers",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCounterOffers();
    }, [productOfferId, toast]);

    const handleAcceptReject = async (offerId: string, action: 'accept' | 'reject') => {
        try {
            const { error } = await supabase
                .from('counter_offers')
                .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
                .eq('id', offerId);

            if (error) throw error;

            // Update the product offer status if accepted
            if (action === 'accept') {
                const { error: updateError } = await supabase
                    .from('product_offers')
                    .update({ status: 'accepted' })
                    .eq('id', productOfferId);

                if (updateError) throw updateError;
            }

            toast({
                title: "Success",
                description: `Counter offer ${action}ed successfully`,
            });

            // Refresh the list
            const { data, error: fetchError } = await supabase
                .from('counter_offers')
                .select('*')
                .eq('product_offer_id', productOfferId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setCounterOffers(data || []);
        } catch (error) {
            console.error('Error updating counter offer:', error);
            toast({
                title: "Error",
                description: `Failed to ${action} counter offer`,
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div>Loading counter offers...</div>;
    }

    if (counterOffers.length === 0) {
        return null;
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Counter Offers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {counterOffers.map((offer) => (
                        <Card key={offer.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <IndianRupee className="h-4 w-4" />
                                        <span className="font-semibold">{offer.amount}</span>
                                    </div>
                                    {offer.message && (
                                        <p className="text-sm text-gray-600 mt-2">{offer.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        {format(new Date(offer.created_at), 'PPP p')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Status: {offer.status}
                                    </p>
                                </div>
                                {offer.status === 'pending' && 
                                 offer.user_id !== currentUserId && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAcceptReject(offer.id, 'accept')}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAcceptReject(offer.id, 'reject')}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default CounterOffersList; 