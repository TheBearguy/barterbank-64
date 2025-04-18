export interface CounterOffer {
    id: string;
    product_offer_id: string;
    user_id: string;
    amount: number;
    message: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
}

export interface CounterOfferFormData {
    amount: number;
    message?: string;
} 