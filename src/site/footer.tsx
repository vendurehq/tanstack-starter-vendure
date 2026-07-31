import Image from '@/components/storefront-image';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {useTranslations} from '@/platform/i18n/paraglide';


const COPYRIGHT_YEAR = 2026;

function Copyright() {
    const t = useTranslations('Footer');
    return (
        <div>
            &copy; {COPYRIGHT_YEAR} {t('copyright')}
        </div>
    )
}

export function Footer({collections}: {collections: Array<{id: string; name: string; slug: string}>}) {
    const t = useTranslations('Footer');

    return (
        <footer className="border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <NavigationLink href="/" className="inline-block mb-4">
                            <Image src="/vendure.svg" alt="Vendure" width={40} height={27} className="h-6 w-auto dark:invert" />
                        </NavigationLink>
                        <p className="text-sm text-muted-foreground text-balance leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('categories')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {collections.map((collection) => (
                                <li key={collection.id}>
                                    <NavigationLink
                                        href={`/collection/${collection.slug}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {collection.name}
                                    </NavigationLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('customer')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <NavigationLink
                                    href="/search"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('shopAll')}
                                </NavigationLink>
                            </li>
                            <li>
                                <NavigationLink
                                    href="/account/orders"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('orders')}
                                </NavigationLink>
                            </li>
                            <li>
                                <NavigationLink
                                    href="/account/profile"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('account')}
                                </NavigationLink>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('vendure')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a
                                    href="https://github.com/vendure-ecommerce"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('github')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://docs.vendure.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('documentation')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/vendure-ecommerce/vendure"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('sourceCode')}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div
                    className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <Copyright/>
                    <div className="flex items-center gap-2">
                        <span>{t('poweredBy')}</span>
                        <a
                            href="https://vendure.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            <Image src="/vendure.svg" alt="Vendure" width={40} height={27} className="h-4 w-auto dark:invert" />
                        </a>
                        <span>&</span>
                        <a
                            href="https://tanstack.com/start"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            <span className="font-semibold">TanStack Start</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
