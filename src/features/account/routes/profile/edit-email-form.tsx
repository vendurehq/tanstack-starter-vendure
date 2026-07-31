import { useActionState, useEffect } from 'react';
import { requestEmailUpdateAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {useTranslations} from '@/platform/i18n/paraglide';
import {useServerFn} from '@tanstack/react-start';

interface EditEmailFormProps {
    currentEmail: string;
}

export function EditEmailForm({ currentEmail }: EditEmailFormProps) {
    const t = useTranslations('Account');
    const requestEmailUpdate = useServerFn(requestEmailUpdateAction);
    const [state, formAction, isPending] = useActionState(
        (_previous: {error?: string; success?: boolean} | undefined, formData: FormData) => requestEmailUpdate({data: {
            password: String(formData.get('password') ?? ''),
            newEmailAddress: String(formData.get('newEmailAddress') ?? ''),
        }}),
        undefined,
    );

    useEffect(() => {
        if (state?.success) {
            const form = document.getElementById('edit-email-form') as HTMLFormElement;
            form?.reset();
        }
    }, [state?.success]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('emailAddress')}</CardTitle>
                <CardDescription>
                    {t('updateEmailDescription')}
                </CardDescription>
            </CardHeader>
            <form id="edit-email-form" action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentEmail">{t('currentEmail')}</Label>
                        <Input
                            id="currentEmail"
                            type="email"
                            value={currentEmail}
                            disabled
                            className="bg-muted"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newEmailAddress">{t('newEmailAddress')}</Label>
                        <Input
                            id="newEmailAddress"
                            name="newEmailAddress"
                            type="email"
                            placeholder="new.email@example.com"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t('currentPassword')}</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('confirmPasswordChange')}
                        </p>
                    </div>
                    {state?.error && (
                        <div className="text-sm text-destructive">
                            {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="text-sm text-green-600">
                            {t('verificationEmailSent')}
                        </div>
                    )}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? t('updating') : t('updateEmail')}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
