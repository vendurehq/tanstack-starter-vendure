import {type ComponentProps, useTransition} from "react";
import {logoutAction} from '@/features/authentication/logout.functions';
import {useRouter} from '@/platform/tanstack/navigation';
import {useTranslations} from '@/platform/i18n/paraglide';
import {useServerFn} from '@tanstack/react-start';

interface LoginButtonProps extends ComponentProps<'button'> {
    isLoggedIn: boolean;
}

export function LoginButton({isLoggedIn, onClick, ...props}: LoginButtonProps) {
    const t = useTranslations('Navigation');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const logout = useServerFn(logoutAction);

    return (
        <button {...props} aria-disabled={isPending}
                onClick={(event) => {
                    // Keep the handler of the wrapper (menu item, sheet close) alive.
                    onClick?.(event)
                    if (isLoggedIn) {
                        startTransition(async () => {
                            await logout()
                            // Logout redirected; reload cached loaders (navbar user, cart)
                            await router.refresh()
                        })
                    } else {
                        router.push('/sign-in')
                    }
                }}>
            {isLoggedIn ? t('signOut') : t('signIn')}
        </button>
    )
}
