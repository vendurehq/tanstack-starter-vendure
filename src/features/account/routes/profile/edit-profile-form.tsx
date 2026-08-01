import { useActionState, useEffect } from 'react';
import { updateCustomerAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {useTranslations} from '@/platform/i18n/paraglide';
import {useRouter} from '@tanstack/react-router';
import {useServerFn} from '@tanstack/react-start';

interface EditProfileFormProps {
    customer: {
        firstName: string;
        lastName: string;
    } | null;
}

export function EditProfileForm({ customer }: EditProfileFormProps) {
    const t = useTranslations('Account');
    const router = useRouter();
    const updateCustomer = useServerFn(updateCustomerAction);
    const [state, formAction, isPending] = useActionState(
        (_previous: {error?: string; success?: boolean} | undefined, formData: FormData) => updateCustomer({data: {
            firstName: String(formData.get('firstName') ?? ''),
            lastName: String(formData.get('lastName') ?? ''),
        }}),
        undefined,
    );

    useEffect(() => {
        if (state?.success) {
            const form = document.getElementById('edit-profile-form') as HTMLFormElement;
            form?.reset();
            router.invalidate();
        }
    }, [state?.success, router]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('personalInformation')}</CardTitle>
                <CardDescription>
                    {t('updatePersonalDetails')}
                </CardDescription>
            </CardHeader>
            <form id="edit-profile-form" action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">{t('firstName')}</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="John"
                            defaultValue={customer?.firstName || ''}
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">{t('lastName')}</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Doe"
                            defaultValue={customer?.lastName || ''}
                            required
                            disabled={isPending}
                        />
                    </div>
                    {state?.error && (
                        <div className="text-sm text-destructive">
                            {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="text-sm text-green-600">
                            {t('profileUpdated')}
                        </div>
                    )}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? t('updating') : t('updateProfile')}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
