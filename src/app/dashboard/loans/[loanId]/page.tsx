import React from 'react';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Loan Details</h1>
                <div className="flex gap-4">
                    {user.id === loan.lender_id && (
                        <Button asChild>
                            <Link href={`/dashboard/loans/${params.loanId}/offers`}>
                                View Product Offers
                            </Link>
                        </Button>
                    )}
                    <Button asChild>
                        <Link href="/dashboard/loans">
                            Back to Loans
                        </Link>
                    </Button>
                </div>
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
            </div>
        </div>
    );
} 