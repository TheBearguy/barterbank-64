export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
}

export interface ProductOffer {
    id: string;
    loan_id: string;
    borrower_id: string;
    category_id: string;
    title: string;
    description: string;
    specifications: string;
    age: string;
    amount: number;
    image_url?: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
}

export interface ProductOfferFormData {
    loan_id: string;
    category_id: string;
    title: string;
    description: string;
    specifications: string;
    age: string;
    amount: number;
    image?: File;
} 