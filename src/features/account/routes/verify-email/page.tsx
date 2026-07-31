import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {useTranslations} from '@/platform/i18n/paraglide';
import { Link } from '@/platform/tanstack/navigation';

export type VerificationResult =
    | {kind: 'invalid'}
    | {kind: 'success'}
    | {kind: 'failed'; message?: string}
    | {kind: 'error'};

export default function VerifyEmailPage({result}: {result: VerificationResult}) {
    const t = useTranslations('Account');
    const content = {
        invalid: [t('verifyEmail.invalidLink'), t('verifyEmail.invalidLinkDesc'), t('verifyEmail.checkEmail')],
        success: [t('verifyEmail.success'), t('verifyEmail.successDesc'), t('verifyEmail.successMessage')],
        failed: [t('verifyEmail.failed'), result.kind === 'failed' && result.message ? result.message : t('verifyEmail.failedDefault'), t('verifyEmail.failedMessage')],
        error: [t('verifyEmail.error'), t('verifyEmail.errorDesc'), t('verifyEmail.errorMessage')],
    }[result.kind];

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>{content[0]}</CardTitle>
                    <CardDescription>{content[1]}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{content[2]}</p>
                    <Button render={<Link href="/account/profile" />} nativeButton={false}>
                        {t('verifyEmail.goToProfile')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
