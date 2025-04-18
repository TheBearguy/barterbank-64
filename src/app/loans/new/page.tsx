import React from 'react';
import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductOfferForm from '@/components/loans/ProductOfferForm';

export default async function NewLoanPage() {
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

    if (!profile || profile.role !== 'borrower') {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">New Loan Request</h1>
                <Button asChild>
                    <Link href="/loans">
                        Back to Loans
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="cash" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cash">Cash Repayment</TabsTrigger>
                    <TabsTrigger value="product">Product Repayment</TabsTrigger>
                </TabsList>
                <TabsContent value="cash" className="mt-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Request Cash Loan</h2>
                        {/* Cash loan form will go here */}
                        <p className="text-gray-500">Cash loan form coming soon...</p>
                    </div>
                </TabsContent>
                <TabsContent value="product" className="mt-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Request Product-Based Loan</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Submit a product offer as collateral for your loan. The lender will review your offer and decide whether to accept it.
                        </p>
                        <ProductOfferForm
                            loanId="new"
                            onSuccess={() => {
                                // This will trigger a revalidation of the page
                                'use server';
                            }}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 