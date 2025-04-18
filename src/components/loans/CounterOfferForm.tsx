'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
    amount: z.number().min(1, 'Amount must be greater than 0'),
    message: z.string().optional(),
});

interface CounterOfferFormProps {
    productOfferId: string;
    currentUserId: string;
    onSuccess: () => void;
}

const CounterOfferForm = ({ productOfferId, currentUserId, onSuccess }: CounterOfferFormProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 0,
            message: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('counter_offers')
                .insert({
                    product_offer_id: productOfferId,
                    user_id: currentUserId,
                    amount: values.amount,
                    message: values.message,
                    status: 'pending',
                });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Counter offer submitted successfully",
            });

            form.reset();
            onSuccess();
        } catch (error) {
            console.error('Error submitting counter offer:', error);
            toast({
                title: "Error",
                description: "Failed to submit counter offer",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Counter Offer Amount (₹)</Label>
                <Input
                    id="amount"
                    type="number"
                    {...form.register('amount', { valueAsNumber: true })}
                    placeholder="Enter your counter offer amount"
                />
                {form.formState.errors.amount && (
                    <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                    id="message"
                    {...form.register('message')}
                    placeholder="Add a message to explain your counter offer"
                    rows={3}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Submitting...' : 'Submit Counter Offer'}
            </Button>
        </form>
    );
};

export default CounterOfferForm; 