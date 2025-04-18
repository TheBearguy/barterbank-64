import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProductOfferForm from '@/components/loans/ProductOfferForm'

export default async function NewProductOfferPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  // Check if user is a borrower
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || profile.role !== 'borrower') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Submit Product Offer</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <ProductOfferForm
            loanId="new"
            onSuccess={() => {
              // This will trigger a revalidation of the page
              'use server'
            }}
          />
        </div>
      </div>
    </div>
  )
} 