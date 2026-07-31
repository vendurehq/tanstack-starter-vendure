import {getRouteLocale} from '@/platform/i18n/server';
import {User} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/platform/tanstack/navigation';
import {LoginButton} from "@/site/navigation/navbar/login-button";
import {getActiveCustomer} from '@/features/account/customer';
import {useTranslations} from '@/platform/i18n/paraglide';


export function NavbarUser({firstName}: {firstName: string | null}) {
    const t = useTranslations('Navigation');

    if (!firstName) {
        return (
            <Button render={<LoginButton isLoggedIn={false} />} variant="ghost" />
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" />}>
                <User className="h-5 w-5"/>
                {t('greeting', {name: firstName})}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem render={<Link href="/account/profile" />}>{t('profile')}</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/orders" />}>{t('orders')}</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem render={<LoginButton isLoggedIn={true} />} nativeButton />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
