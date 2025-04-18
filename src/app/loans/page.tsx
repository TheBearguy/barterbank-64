import React from 'react';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default async function LoansPage() {
    const supabase = createServerComponentClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        notFound();
    }

    // Get user's profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile) {
        notFound();
    }

    // Get loans based on user role
    const { data: loans } = await supabase
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
        .eq(profile.role === 'borrower' ? 'borrower_id' : 'lender_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Loans</h1>
                {profile.role === 'borrower' && (
                    <Button asChild>
                        <Link href="/loans/new">
                            New Loan Request
                        </Link>
                    </Button>
                )}
            </div>

            {loans?.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No loans found.</p>
                    {profile.role === 'borrower' && (
                        <Button asChild className="mt-4">
                            <Link href="/loans/new">
                                Request a New Loan
                            </Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {loans?.map((loan) => (
                        <Card key={loan.id}>
                            <CardHeader>
                                <CardTitle>Loan #{loan.id.slice(0, 8)}</CardTitle>
                                <CardDescription>
                                    {profile.role === 'borrower' 
                                        ? `Lender: ${loan.lender?.name}`
                                        : `Borrower: ${loan.borrower?.name}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Amount</p>
                                        <p className="font-medium">${loan.amount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <p className="font-medium">{loan.status}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild>
                                    <Link href={`/loans/${loan.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 