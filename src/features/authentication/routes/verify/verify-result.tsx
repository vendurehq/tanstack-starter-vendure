import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Link} from '@tanstack/react-router';
import {CheckCircle, XCircle} from 'lucide-react';
import {useTranslations} from '@/platform/i18n/paraglide';

type VerifyResultType = {success: boolean; error?: undefined} | {error: string; success?: undefined};

interface VerifyResultProps { result: VerifyResultType; }

export function VerifyResult({result}: VerifyResultProps) {
    const t = useTranslations('Verify');

    const isSuccess = 'success' in result;

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                {isSuccess ? (
                    <>
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-600"/>
                        </div>
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold">{t('accountVerified')}</h1>
                            <p className="text-muted-foreground">
                                {t('accountVerifiedMessage')}
                            </p>
                        </div>
                        <Button render={<Link to="/sign-in" />} nativeButton={false} className="w-full">
                            {t('backToSignIn')}
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="flex justify-center">
                            <XCircle className="h-16 w-16 text-destructive"/>
                        </div>
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold">{t('verificationFailed')}</h1>
                            <p className="text-muted-foreground">
                                {result.error || t('verificationFailedMessage')}
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
                    </>
                )}
            </CardContent>
        </Card>
    );
}
