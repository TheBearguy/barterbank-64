'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ProductOfferForm from '@/components/loans/ProductOfferForm'
import { useState } from 'react'

export default function CreateLoanPage() {
  const [activeTab, setActiveTab] = useState('product')

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Loan Request</h1>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="cash">Cash Repayment</TabsTrigger>
              <TabsTrigger value="product">Product Repayment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cash">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Request Cash Loan</h2>
                <p className="text-gray-500">Cash loan form coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="product">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Request Product-Based Loan</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Submit a product offer as collateral for your loan. The lender will review your offer and decide whether to accept it.
                </p>
                <ProductOfferForm
                  loanId="new"
                  onSuccess={() => {
                    // This will trigger a revalidation of the page
                    'use server'
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 