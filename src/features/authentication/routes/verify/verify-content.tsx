'use client';

import {VerifyResult} from './verify-result';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Link} from '@tanstack/react-router';
import {XCircle} from 'lucide-react';
import {useTranslations} from '@/platform/i18n/paraglide';

interface VerifyContentProps {
    token?: string;
    result: {success: boolean; error?: undefined} | {error: string; success?: undefined} | null;
}

export function VerifyContent({token, result}: VerifyContentProps) {
    const t = useTranslations('Verify');

    if (!token) {
        return (
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-center">
                        <XCircle className="h-16 w-16 text-destructive"/>
                    </div>
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-bold">{t('invalidLink')}</h1>
                        <p className="text-muted-foreground">
                            {t('invalidLinkMessage')}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button render={<Link to="/register" />} nativeButton={false} variant="outline" className="w-full">
                            {t('createNewAccount')}
                        </Button>
                        <Button render={<Link to="/sign-in" />} nativeButton={false} variant="ghost" className="w-full">
                            {t('backToSignIn')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return result ? <VerifyResult result={result}/> : null;
}
