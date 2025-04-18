import React from 'react';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ProductOfferReview } from '@/components/loans/ProductOfferReview';
import { ProductOffer } from '@/types/product';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
    params: {
        loanId: string;
    };
}

export default async function LoanOffersPage({ params }: PageProps) {
    const supabase = createServerComponentClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        notFound();
    }

    // Get the loan details to verify ownership
    const { data: loan } = await supabase
        .from('loans')
        .select('*')
        .eq('id', params.loanId)
        .single();

    if (!loan || loan.lender_id !== user.id) {
        notFound();
    }

    // Get all product offers for this loan
    const { data: offers } = await supabase
        .from('product_offers')
        .select(`
            *,
            borrower:profiles!product_offers_borrower_id_fkey (
                id,
                name,
                email
            )
        `)
        .eq('loan_id', params.loanId)
        .order('created_at', { ascending: false });

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Product Offers</h1>
                <Button asChild>
                    <Link href={`/dashboard/loans/${params.loanId}`}>
                        Back to Loan Details
                    </Link>
                </Button>
            </div>

            {offers?.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No product offers have been made for this loan yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {offers?.map((offer: ProductOffer) => (
                        <ProductOfferReview
                            key={offer.id}
                            offer={offer}
                            onStatusChange={() => {
                                // This will trigger a revalidation of the page
                                'use server';
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 