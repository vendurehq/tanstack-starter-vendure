import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {Link} from '@tanstack/react-router';
import { CheckCircle } from 'lucide-react';
import {useTranslations} from '@/platform/i18n/paraglide';

function VerifyPendingContent({redirectTo}: {redirectTo?: string}) {
    const t = useTranslations('Verify');

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">{t('pending.title')}</h1>
                    <p className="text-muted-foreground">
                        {t('pending.message')}
                    </p>
                </div>
                <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                        {t('pending.spamNote')}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <Button render={<Link to="/sign-in" search={{redirectTo}} />} nativeButton={false} className="w-full">
                    {t('pending.goToSignIn')}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function VerifyPendingPage({redirectTo}: {redirectTo?: string}) {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <VerifyPendingContent redirectTo={redirectTo} />
            </div>
        </div>
    );
}
