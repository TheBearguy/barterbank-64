-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default categories
INSERT INTO product_categories (name, description) VALUES
    ('Electronics', 'Electronic devices and gadgets'),
    ('Precious', 'Precious metals, jewelry, and valuables'),
    ('Ancient', 'Antiques and collectibles'),
    ('Others', 'Other types of products')
ON CONFLICT (name) DO NOTHING;

-- Create product offers table
CREATE TABLE IF NOT EXISTS product_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    borrower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    specifications TEXT NOT NULL,
    age TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_offers_loan_id ON product_offers(loan_id);
CREATE INDEX IF NOT EXISTS idx_product_offers_borrower_id ON product_offers(borrower_id);
CREATE INDEX IF NOT EXISTS idx_product_offers_category_id ON product_offers(category_id);

-- Enable Row Level Security
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Product categories are viewable by everyone"
    ON product_categories FOR SELECT
    USING (true);

CREATE POLICY "Borrowers can view their own product offers"
    ON product_offers FOR SELECT
    USING (borrower_id = auth.uid());

CREATE POLICY "Lenders can view product offers for their loans"
    ON product_offers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM loans
            WHERE loans.id = product_offers.loan_id
            AND loans.lender_id = auth.uid()
        )
    );

CREATE POLICY "Borrowers can create product offers"
    ON product_offers FOR INSERT
    WITH CHECK (borrower_id = auth.uid());

CREATE POLICY "Lenders can update product offer status"
    ON product_offers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM loans
            WHERE loans.id = product_offers.loan_id
            AND loans.lender_id = auth.uid()
        )
    )
    WITH CHECK (
        status IN ('accepted', 'rejected') AND
        EXISTS (
            SELECT 1 FROM loans
            WHERE loans.id = product_offers.loan_id
            AND loans.lender_id = auth.uid()
        )
    ); 