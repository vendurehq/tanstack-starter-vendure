import { useActionState } from 'react';
import { resetPasswordAction } from './actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {Link, useRouter} from '@tanstack/react-router';
import {useTranslations} from '@/platform/i18n/paraglide';
import {useServerFn} from '@tanstack/react-start';

interface ResetPasswordFormProps {
    token?: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const t = useTranslations('Auth');

    const resetPassword = useServerFn(resetPasswordAction);
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(
        async (_previousState: {error?: string} | undefined, formData: FormData) => {
            const result = await resetPassword({data: {
                token: String(formData.get('token') ?? ''),
                password: String(formData.get('password') ?? ''),
                confirmPassword: String(formData.get('confirmPassword') ?? ''),
            }});
            // Successful reset logs the customer in and redirects; reload cached loaders
            if (!result?.error) await router.invalidate();
            return result;
        },
        undefined,
    );

    if (!token) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('invalidResetLink')}</CardTitle>
                    <CardDescription>
                        {t('invalidResetLinkDescription')}
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button render={<Link to="/forgot-password" />} nativeButton={false} variant="outline" className="w-full">
                        {t('requestNewResetLink')}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('resetYourPassword')}</CardTitle>
                <CardDescription>
                    {t('resetYourPasswordDescription')}
                </CardDescription>
            </CardHeader>
            <form action={formAction}>
                <input type="hidden" name="token" value={token} />
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">{t('newPassword')}</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            disabled={isPending}
                        />
                    </div>
                    {state?.error && (
                        <div className="text-sm text-destructive">
                            {state.error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? t('resettingPassword') : t('resetPassword')}
                    </Button>
                    <Link
                        to="/sign-in"
                        className="text-sm text-center text-muted-foreground hover:text-primary"
                    >
                        {t('backToSignIn')}
                    </Link>
                </CardFooter>
            </form>
        </Card>
    );
}
