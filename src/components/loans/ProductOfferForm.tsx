'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProductOfferFormData } from '@/types/product';

const formSchema = z.object({
    loan_id: z.string(),
    category_id: z.string().min(1, 'Category is required'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    specifications: z.string().min(10, 'Specifications must be at least 10 characters'),
    age: z.string().min(1, 'Age is required'),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    image: z.instanceof(File).optional(),
});

interface ProductOfferFormProps {
    loanId: string;
    onSuccess: () => void;
}

const ProductOfferForm = ({ loanId, onSuccess }: ProductOfferFormProps) => {
    const { toast } = useToast();
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const form = useForm<ProductOfferFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            loan_id: loanId,
            category_id: '',
            title: '',
            description: '',
            specifications: '',
            age: '',
            amount: 0,
        },
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('product_categories')
                    .select('id, name');
                
                if (error) throw error;
                setCategories(data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast({
                    title: "Error",
                    description: "Failed to load product categories",
                    variant: "destructive",
                });
            }
        };

        fetchCategories();
    }, [toast]);

    const uploadImage = async (file: File) => {
        try {
            // Get the current user's ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            // Include user ID in the path for better organization
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase
                .storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase
                .storage
                .from('product-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const onSubmit = async (data: ProductOfferFormData) => {
        try {
            setLoading(true);
            
            let imageUrl = '';
            if (data.image) {
                setUploadingImage(true);
                try {
                    imageUrl = await uploadImage(data.image);
                } catch (error) {
                    toast({
                        title: "Error",
                        description: "Failed to upload product image. Please try again.",
                        variant: "destructive",
                    });
                    return;
                } finally {
                    setUploadingImage(false);
                }
            }

            // Get the current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            let loanId = data.loan_id;

            // If loanId is 'new', create a new loan first
            if (loanId === 'new') {
                const { data: loan, error: loanError } = await supabase
                    .from('loans')
                    .insert({
                        borrower_id: user.id,
                        amount: data.amount,
                        description: data.description,
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (loanError) throw loanError;
                loanId = loan.id;
            }

            // Create the product offer
            const { error: insertError } = await supabase
                .from('product_offers')
                .insert({
                    loan_id: loanId,
                    borrower_id: user.id,
                    category_id: data.category_id,
                    title: data.title,
                    description: data.description,
                    specifications: data.specifications,
                    age: data.age,
                    amount: data.amount,
                    image_url: imageUrl,
                    status: 'pending',
                });

            if (insertError) throw insertError;

            toast({
                title: "Success",
                description: "Product offer submitted successfully",
            });

            onSuccess();
        } catch (error) {
            console.error('Error submitting product offer:', error);
            toast({
                title: "Error",
                description: "Failed to submit product offer. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="category">Product Category</Label>
                <Select
                    onValueChange={(value) => form.setValue('category_id', value)}
                    value={form.watch('category_id')}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.formState.errors.category_id && (
                    <p className="text-sm text-red-500">{form.formState.errors.category_id.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
                <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="Enter product title"
                />
                {form.formState.errors.title && (
                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Describe your product"
                    rows={4}
                />
                {form.formState.errors.description && (
                    <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                    id="specifications"
                    {...form.register('specifications')}
                    placeholder="Enter product specifications"
                    rows={4}
                />
                {form.formState.errors.specifications && (
                    <p className="text-sm text-red-500">{form.formState.errors.specifications.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="age">Product Age</Label>
                <Input
                    id="age"
                    {...form.register('age')}
                    placeholder="e.g., 2 years"
                />
                {form.formState.errors.age && (
                    <p className="text-sm text-red-500">{form.formState.errors.age.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Desired Amount (₹)</Label>
                <Input
                    id="amount"
                    type="number"
                    {...form.register('amount', { valueAsNumber: true })}
                    placeholder="Enter desired amount"
                />
                {form.formState.errors.amount && (
                    <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            form.setValue('image', file);
                        }
                    }}
                />
                {form.formState.errors.image && (
                    <p className="text-sm text-red-500">{form.formState.errors.image.message}</p>
                )}
            </div>

            <Button 
                type="submit" 
                disabled={loading || uploadingImage}
                className="w-full"
            >
                {loading || uploadingImage ? 'Submitting...' : 'Submit Product Offer'}
            </Button>
        </form>
    );
};

export default ProductOfferForm; 