'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { requestPasswordResetAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {Link} from '@tanstack/react-router';
import {useTranslations} from '@/platform/i18n/paraglide';
import {useServerFn} from '@tanstack/react-start';

function createForgotPasswordSchema(t: ReturnType<typeof useTranslations<'Auth'>>) {
    return z.object({
        emailAddress: z.email(t('emailValidation')),
    });
}

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export function ForgotPasswordForm() {
    const t = useTranslations('Auth');
    const [isPending, startTransition] = useTransition();
    const [success, setSuccess] = useState(false);
    const requestPasswordReset = useServerFn(requestPasswordResetAction);

    const forgotPasswordSchema = createForgotPasswordSchema(t);
    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            emailAddress: '',
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        startTransition(async () => {
            await requestPasswordReset({data});
            setSuccess(true);
        });
    };

    if (success) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('checkYourEmail')}</CardTitle>
                    <CardDescription>
                        {t('checkYourEmailDescription')}
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button render={<Link to="/sign-in" />} nativeButton={false} variant="outline" className="w-full">
                        {t('backToSignIn')}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('forgotPasswordTitle')}</CardTitle>
                <CardDescription>
                    {t('forgotPasswordDescription')}
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="emailAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('email')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 mt-4">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? t('sending') : t('sendResetLink')}
                        </Button>
                        <Link
                            to="/sign-in"
                            className="text-sm text-center text-muted-foreground hover:text-primary"
                        >
                            {t('backToSignIn')}
                        </Link>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
