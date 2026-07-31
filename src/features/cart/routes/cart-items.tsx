'use client';

import Image from '@/components/storefront-image';
import { Link } from '@/platform/tanstack/navigation';
import {Button} from '@/components/ui/button';
import {Minus, Plus, X} from 'lucide-react';
import {Price} from '@/features/pricing/price';
import {removeFromCart, adjustQuantity} from './actions';
import {useTranslations} from '@/platform/i18n/paraglide';
import {useServerFn} from '@tanstack/react-start';
import {useRouter} from '@/platform/tanstack/navigation';
import {useTransition} from 'react';

type ActiveOrder = {
    id: string;
    currencyCode: string;
    lines: Array<{
        id: string;
        quantity: number;
        unitPriceWithTax: number;
        linePriceWithTax: number;
        productVariant: {
            id: string;
            name: string;
            sku: string;
            product: {
                name: string;
                slug: string;
                featuredAsset?: {
                    preview: string;
                } | null;
            };
        };
    }>;
};

export function CartItems({activeOrder}: { activeOrder: ActiveOrder | null }) {
    const t = useTranslations('Cart');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const adjust = useServerFn(adjustQuantity);
    const remove = useServerFn(removeFromCart);
    const run = (mutation: () => Promise<unknown>) => startTransition(async () => {
        await mutation();
        await router.refresh();
    });
    if (!activeOrder || activeOrder.lines.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">{t('empty')}</h1>
                    <p className="text-muted-foreground mb-8">
                        {t('emptyMessage')}
                    </p>
                    <Button render={<Link href="/" />} nativeButton={false}>{t('continueShopping')}</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 divide-y divide-border">
            {activeOrder.lines.map((line) => (
                <div
                    key={line.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 first:rounded-t-xl last:rounded-b-xl border-x first:border-t last:border-b bg-card transition-colors duration-200 hover:bg-muted/30"
                >
                    {line.productVariant.product.featuredAsset && (
                        <Link
                            href={`/product/${line.productVariant.product.slug}`}
                            className="flex-shrink-0"
                        >
                            <Image
                                src={line.productVariant.product.featuredAsset.preview}
                                alt={line.productVariant.name}
                                width={120}
                                height={120}
                                className="rounded-xl object-cover w-full sm:w-[120px] h-[120px]"
                            />
                        </Link>
                    )}

                    <div className="flex-grow min-w-0">
                        <Link
                            href={`/product/${line.productVariant.product.slug}`}
                            className="font-semibold hover:underline block"
                        >
                            {line.productVariant.product.name}
                        </Link>
                        {line.productVariant.name !== line.productVariant.product.name && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {line.productVariant.name}
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('sku', {sku: line.productVariant.sku})}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 sm:hidden">
                            <Price value={line.unitPriceWithTax} currencyCode={activeOrder.currencyCode}/> {t('each')}
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                            <div className="flex items-center gap-1 border rounded-full bg-muted/50">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-background"
                                        disabled={isPending || line.quantity <= 1}
                                        onClick={() => run(() => adjust({data: {lineId: line.id, quantity: Math.max(1, line.quantity - 1)}}))}
                                    >
                                        <Minus className="h-4 w-4"/>
                                    </Button>

                                <span className="w-10 text-center font-semibold tabular-nums transition-all duration-200">{line.quantity}</span>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-background"
                                        disabled={isPending}
                                        onClick={() => run(() => adjust({data: {lineId: line.id, quantity: line.quantity + 1}}))}
                                    >
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                            </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                                    disabled={isPending}
                                    onClick={() => run(() => remove({data: {lineId: line.id}}))}
                                >
                                    <X className="h-5 w-5"/>
                                </Button>

                            <div className="sm:hidden ml-auto">
                                <p className="font-semibold text-lg">
                                    <Price value={line.linePriceWithTax}
                                           currencyCode={activeOrder.currencyCode}/>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block text-right flex-shrink-0">
                        <p className="font-semibold text-lg">
                            <Price value={line.linePriceWithTax} currencyCode={activeOrder.currencyCode}/>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            <Price value={line.unitPriceWithTax} currencyCode={activeOrder.currencyCode}/> {t('each')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
