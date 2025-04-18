import React from 'react';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductOfferReview from '@/components/loans/ProductOfferReview';
import ProductOfferForm from '@/components/loans/ProductOfferForm';
import { ProductOffer } from '@/types/product';

interface PageProps {
    params: {
        loanId: string;
    };
}

export default async function LoanDetailsPage({ params }: PageProps) {
    const supabase = createServerComponentClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        notFound();
    }

    // Get the loan details
    const { data: loan } = await supabase
        .from('loans')
        .select(`
            *,
            borrower:profiles!loans_borrower_id_fkey (
                id,
                name,
                email
            ),
            lender:profiles!loans_lender_id_fkey (
                id,
                name,
                email
            )
        `)
        .eq('id', params.loanId)
        .single();

    if (!loan) {
        notFound();
    }

    // Get all product offers for this loan if user is the lender
    let offers: ProductOffer[] = [];
    if (user.id === loan.lender_id) {
        const { data: offersData } = await supabase
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
        
        offers = offersData || [];
    }

    const isBorrower = user.id === loan.borrower_id;
    const isLender = user.id === loan.lender_id;

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Loan Details</h1>
                <Button asChild>
                    <Link href="/loans">
                        Back to Loans
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Loan details content */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Loan Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-medium">${loan.amount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Status</p>
                            <p className="font-medium">{loan.status}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Borrower</p>
                            <p className="font-medium">{loan.borrower?.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Lender</p>
                            <p className="font-medium">{loan.lender?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Product offers section - only visible to lender */}
                {isLender && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Product Offers</h2>
                        {offers.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No product offers have been made for this loan yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {offers.map((offer: ProductOffer) => (
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
                )}

                {/* Product offer form - only visible to borrower */}
                {isBorrower && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Submit Product Offer</h2>
                        <ProductOfferForm
                            loanId={params.loanId}
                            onSuccess={() => {
                                // This will trigger a revalidation of the page
                                'use server';
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
} 