import {useState} from 'react';
import {Await} from '@tanstack/react-router';
import { Link, useRouter } from '@/platform/tanstack/navigation';
import {Menu, Search, ShoppingBag, User, Package, MapPin} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import {useTranslations} from '@/platform/i18n/paraglide';
import {LoginButton} from '@/site/navigation/navbar/login-button';
import {MobilePreferences} from '@/site/navigation/navbar/mobile-preferences';
import type {getPersonalizedShellData} from '@/site/shell.functions';

interface Collection {
    id: string;
    name: string;
    slug: string;
}

interface MobileNavProps {
    collections: Collection[];
    availableCurrencyCodes: string[];
    activeCurrencyCode: string;
    personalized: Promise<Awaited<ReturnType<typeof getPersonalizedShellData>>>;
}

const rowClassName =
    'flex min-h-11 items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md hover:bg-accent transition-colors';

export function MobileNav({
    collections,
    availableCurrencyCodes,
    activeCurrencyCode,
    personalized,
}: MobileNavProps) {
    const t = useTranslations('Navigation');
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;
        router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
        setOpen(false);
    };

    const handleLinkClick = () => {
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="size-11 md:hidden" />}>
                <Menu className="size-5" />
                <span className="sr-only">{t('openMenu')}</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t('menu')}</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6 px-4 pb-6">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={t('searchProducts')}
                            className="pl-9 w-full h-11"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </form>

                    {/* Shop All */}
                    <div>
                        <SheetClose
                            render={
                                <Link
                                    href="/search"
                                    className={rowClassName}
                                />
                            }
                            nativeButton={false}
                            onClick={handleLinkClick}
                        >
                            <ShoppingBag className="h-5 w-5" />
                            {t('shopAll')}
                        </SheetClose>
                    </div>

                    {/* Collections */}
                    {collections.length > 0 && (
                        <div>
                            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t('collections')}
                            </p>
                            <nav className="flex flex-col gap-0.5">
                                {collections.map((collection) => (
                                    <SheetClose
                                        key={collection.slug}
                                        render={
                                            <Link
                                                href={`/collection/${collection.slug}`}
                                                className={rowClassName}
                                            />
                                        }
                                        nativeButton={false}
                                        onClick={handleLinkClick}
                                    >
                                        {collection.name}
                                    </SheetClose>
                                ))}
                            </nav>
                        </div>
                    )}

                    {/* Account links */}
                    <div>
                        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('account')}
                        </p>
                        <nav className="flex flex-col gap-0.5">
                            <SheetClose
                                render={
                                    <Link
                                        href="/account/profile"
                                        className={rowClassName}
                                    />
                                }
                                nativeButton={false}
                                onClick={handleLinkClick}
                            >
                                <User className="h-5 w-5" />
                                {t('profile')}
                            </SheetClose>
                            <SheetClose
                                render={
                                    <Link
                                        href="/account/orders"
                                        className={rowClassName}
                                    />
                                }
                                nativeButton={false}
                                onClick={handleLinkClick}
                            >
                                <Package className="h-5 w-5" />
                                {t('orders')}
                            </SheetClose>
                            <SheetClose
                                render={
                                    <Link
                                        href="/account/addresses"
                                        className={rowClassName}
                                    />
                                }
                                nativeButton={false}
                                onClick={handleLinkClick}
                            >
                                <MapPin className="h-5 w-5" />
                                {t('addresses')}
                            </SheetClose>
                            {/* Sign in / sign out — the desktop header keeps this in the user
                                menu, which is hidden at mobile widths. */}
                            <Await
                                promise={personalized}
                                fallback={<Skeleton className="h-11 w-full rounded-md" />}
                            >
                                {(data) => (
                                    <SheetClose
                                        render={
                                            <LoginButton
                                                isLoggedIn={Boolean(data.customerFirstName)}
                                                className={`${rowClassName} w-full text-left`}
                                            />
                                        }
                                    />
                                )}
                            </Await>
                        </nav>
                    </div>

                    {/* Language, currency and theme */}
                    <MobilePreferences
                        availableCurrencyCodes={availableCurrencyCodes}
                        activeCurrencyCode={activeCurrencyCode}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
