import {useTranslations} from '@/platform/i18n/paraglide';
import {LoginForm} from "./login-form";
import {SITE_NAME} from "@/config/metadata";

export default function SignInPage({redirectTo}: {redirectTo?: string}) {
    const t = useTranslations('Auth');

    return (
        <div className="flex min-h-[calc(100vh-4rem)] mt-16">
            {/* Branded panel - desktop only */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/70 items-center justify-center p-12 rounded-br-3xl">
                <div className="max-w-md text-primary-foreground space-y-6">
                    <h2 className="text-4xl font-bold tracking-tight">{SITE_NAME}</h2>
                    <p className="text-xl text-primary-foreground/80 leading-relaxed">
                        {t('welcomeBack')}
                    </p>
                    <div className="flex gap-8 pt-4">
                        <div>
                            <p className="text-3xl font-bold">{t('featureFast')}</p>
                            <p className="text-sm text-primary-foreground/70">{t('featureCheckout')}</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{t('featureSecure')}</p>
                            <p className="text-sm text-primary-foreground/70">{t('featurePayments')}</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{t('featureEasy')}</p>
                            <p className="text-sm text-primary-foreground/70">{t('featureReturns')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form panel */}
            <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-2 text-center">
                        <p className="text-sm font-medium text-primary tracking-wider uppercase lg:hidden">{SITE_NAME}</p>
                        <h1 className="text-3xl font-bold">{t('signIn')}</h1>
                        <p className="text-muted-foreground">
                            {t('enterCredentials')}
                        </p>
                    </div>
                    <LoginForm redirectTo={redirectTo}/>
                </div>
            </div>
        </div>
    );
}
