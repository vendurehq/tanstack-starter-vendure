'use client'

import {ComponentProps, useTransition} from "react";
import {logoutAction} from '@/features/authentication/logout';
import {useRouter} from '@/platform/tanstack/navigation';
import {useTranslations} from '@/platform/i18n/paraglide';
import {useServerFn} from '@tanstack/react-start';

interface LoginButtonProps extends ComponentProps<'button'> {
    isLoggedIn: boolean;
}

export function LoginButton({isLoggedIn, ...props}: LoginButtonProps) {
    const t = useTranslations('Navigation');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const logout = useServerFn(logoutAction);

    return (
        <button {...props} aria-disabled={isPending}
                onClick={() => {
                    if (isLoggedIn) {
                        startTransition(async () => {
                            await logout()
                        })
                    } else {
                        router.push('/sign-in')
                    }
                }}>
            {isLoggedIn ? t('signOut') : t('signIn')}
        </button>
    )
}
