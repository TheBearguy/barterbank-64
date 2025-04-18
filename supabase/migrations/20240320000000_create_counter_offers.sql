-- Create counter_offers table
CREATE TABLE IF NOT EXISTS public.counter_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_offer_id UUID NOT NULL REFERENCES public.product_offers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.counter_offers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view counter offers for their product offers"
    ON public.counter_offers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.product_offers
            WHERE product_offers.id = counter_offers.product_offer_id
            AND (
                product_offers.borrower_id = auth.uid()
                OR product_offers.loan_id IN (
                    SELECT id FROM public.loans
                    WHERE lender_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can create counter offers"
    ON public.counter_offers
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.product_offers
            WHERE product_offers.id = product_offer_id
            AND (
                (product_offers.borrower_id = auth.uid() AND counter_offers.user_id = auth.uid())
                OR (
                    product_offers.loan_id IN (
                        SELECT id FROM public.loans
                        WHERE lender_id = auth.uid()
                    )
                    AND counter_offers.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can update their own counter offers"
    ON public.counter_offers
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.counter_offers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 