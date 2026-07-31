import type {getActiveCustomer} from '@/features/account/customer';
import { ChangePasswordForm } from './change-password-form';
import { EditProfileForm } from './edit-profile-form';
import { EditEmailForm } from './edit-email-form';
import {useTranslations} from '@/platform/i18n/paraglide';

export default function ProfilePage({customer}: {customer: Awaited<ReturnType<typeof getActiveCustomer>>}) {
    const t = useTranslations('Account');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('profile')}</h1>
                <p className="text-muted-foreground mt-2">
                    {t('manageAccountInfo')}
                </p>
            </div>

            <EditProfileForm customer={customer} />

            <EditEmailForm currentEmail={customer?.emailAddress || ''} />

            <ChangePasswordForm />
        </div>
    );
}
