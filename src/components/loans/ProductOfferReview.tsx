import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ProductOffer } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import Image from 'next/image';

interface ProductOfferReviewProps {
    offer: ProductOffer;
    onStatusChange: () => void;
}

const ProductOfferReview: React.FC<ProductOfferReviewProps> = ({ offer, onStatusChange }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async (newStatus: 'accepted' | 'rejected') => {
        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('product_offers')
                .update({ status: newStatus })
                .eq('id', offer.id);

            if (error) throw error;

            toast({
                title: 'Success',
                description: `Offer ${newStatus} successfully`,
            });

            onStatusChange();
        } catch (error) {
            console.error('Error updating offer status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update offer status',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{offer.title}</CardTitle>
                <CardDescription>
                    Offered by borrower for loan repayment
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {offer.image_url && (
                    <div className="relative h-48 w-full">
                        <Image
                            src={offer.image_url}
                            alt={offer.title}
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                )}
                
                <div>
                    <h4 className="font-medium">Description</h4>
                    <p className="text-sm text-gray-500">{offer.description}</p>
                </div>

                <div>
                    <h4 className="font-medium">Specifications</h4>
                    <p className="text-sm text-gray-500">{offer.specifications}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium">Age</h4>
                        <p className="text-sm text-gray-500">{offer.age}</p>
                    </div>
                    <div>
                        <h4 className="font-medium">Desired Amount</h4>
                        <p className="text-sm text-gray-500">${offer.amount.toFixed(2)}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                <Button
                    variant="destructive"
                    onClick={() => handleStatusChange('rejected')}
                    disabled={isLoading || offer.status !== 'pending'}
                >
                    Reject
                </Button>
                <Button
                    onClick={() => handleStatusChange('accepted')}
                    disabled={isLoading || offer.status !== 'pending'}
                >
                    Accept
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProductOfferReview; 