import {useState, useMemo, useRef, useTransition} from 'react';
import {useSearchParams} from '@/platform/tanstack/navigation';
import {usePathname, useRouter} from '@/platform/tanstack/navigation';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Separator} from '@/components/ui/separator';
import {ShoppingCart, CheckCircle2} from 'lucide-react';
import {addToCart} from '@/features/products/add-to-cart.functions';
import {getLowestVariantPrice, getSelectedOptionNames} from '@/features/products/product-options';
import {toast} from 'sonner';
import {Price} from '@/features/pricing/price';
import {useTranslations} from '@/platform/i18n/paraglide';
import {useServerFn} from '@tanstack/react-start';

interface ProductInfoProps {
    product: {
        id: string;
        name: string;
        description: string;
        variants: Array<{
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            stockLevel: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
                groupId: string;
                group: {
                    id: string;
                    code: string;
                    name: string;
                };
            }>;
        }>;
        optionGroups: Array<{
            id: string;
            code: string;
            name: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
            }>;
        }>;
    };
    searchParams: { [key: string]: string | string[] | undefined };
    currencyCode: string;
}

export function ProductInfo({product, searchParams, currencyCode}: ProductInfoProps) {
    const t = useTranslations('Product');
    const pathname = usePathname();
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);
    const isSubmitting = useRef(false);
    const addProductToCart = useServerFn(addToCart);

    // Initialize selected options from URL
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};

        // Load from URL search params
        product.optionGroups.forEach((group) => {
            const paramValue = searchParams[group.code];
            if (typeof paramValue === 'string') {
                // Find the option by code
                const option = group.options.find((opt) => opt.code === paramValue);
                if (option) {
                    initialOptions[group.id] = option.id;
                }
            }
        });

        return initialOptions;
    });

    // Find the matching variant based on selected options
    const selectedVariant = useMemo(() => {
        if (product.variants.length === 1) {
            return product.variants[0];
        }

        // If not all option groups have a selection, return null
        if (Object.keys(selectedOptions).length !== product.optionGroups.length) {
            return null;
        }

        // Find variant that matches all selected options
        return product.variants.find((variant) => {
            const variantOptionIds = variant.options.map((opt) => opt.id);
            const selectedOptionIds = Object.values(selectedOptions);
            return selectedOptionIds.every((optId) => variantOptionIds.includes(optId));
        });
    }, [selectedOptions, product.variants, product.optionGroups]);

    const handleOptionChange = (groupId: string, optionId: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [groupId]: optionId,
        }));

        // Find the option group and option to get their codes
        const group = product.optionGroups.find((g) => g.id === groupId);
        const option = group?.options.find((opt) => opt.id === optionId);

        if (group && option) {
            // Update URL with option code
            const params = new URLSearchParams(currentSearchParams);
            params.set(group.code, option.code);
            router.push(`${pathname}?${params.toString()}`, {scroll: false});
        }
    };

    const handleAddToCart = async () => {
        // The inline desktop action and the mobile purchase bar share this handler,
        // so an in-flight request must reject further taps before isPending updates.
        if (!selectedVariant || isSubmitting.current) return;
        isSubmitting.current = true;

        startTransition(async () => {
            try {
                const result = await addProductToCart({data: {variantId: selectedVariant.id, quantity: 1}});

                if (result.success) {
                    // Re-run route loaders so the navbar cart count picks up the new order state
                    await router.refresh();
                    setIsAdded(true);
                    toast.success(t('addedToCartMessage'), {
                        description: t('addedToCartDescription', {name: product.name}),
                    });

                    // Reset the added state after 2 seconds
                    setTimeout(() => setIsAdded(false), 2000);
                } else {
                    toast.error(t('errorTitle'), {
                        description: result.error || t('errorAddToCart'),
                    });
                }
            } finally {
                isSubmitting.current = false;
            }
        });
    };

    const isInStock = selectedVariant && selectedVariant.stockLevel !== 'OUT_OF_STOCK';
    const canAddToCart = selectedVariant && isInStock;

    const selectedOptionNames = getSelectedOptionNames(product.optionGroups, selectedOptions);
    const lowestVariantPrice = getLowestVariantPrice(product.variants);

    // One label and icon for both purchase actions, so they never disagree.
    const purchaseIcon = isAdded
        ? <CheckCircle2 className="mr-2 h-5 w-5"/>
        : <ShoppingCart className="mr-2 h-5 w-5"/>;
    const purchaseLabel = isAdded
        ? t('addedToCart')
        : isPending
            ? t('adding')
            : !selectedVariant && product.optionGroups.length > 0
                ? t('selectOptions')
                : !isInStock
                    ? t('outOfStock')
                    : t('addToCart');

    return (
        <div className="space-y-6">
            {/* Product Title & Price */}
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
                {selectedVariant && (
                    <p className="text-2xl md:text-3xl text-muted-foreground font-semibold mt-3">
                        <Price value={selectedVariant.priceWithTax} currencyCode={currencyCode}/>
                    </p>
                )}
            </div>

            <Separator />

            {/* Product Description */}
            <div className="prose prose-sm max-w-none text-muted-foreground">
                {/* biome-ignore lint/security/noDangerouslySetInnerHtml: renders trusted HTML from the Vendure API */}
                <div dangerouslySetInnerHTML={{__html: product.description}}/>
            </div>

            {/* Option Groups */}
            {product.optionGroups.length > 0 && (
                <div className="space-y-5">
                    {product.optionGroups.map((group) => (
                        <div key={group.id} className="space-y-3">
                            <Label className="text-base font-semibold">
                                {group.name}
                            </Label>
                            <RadioGroup
                                value={selectedOptions[group.id] || ''}
                                onValueChange={(value) => handleOptionChange(group.id, value)}
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {group.options.map((option) => (
                                        <div key={option.id}>
                                            <RadioGroupItem
                                                value={option.id}
                                                id={option.id}
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor={option.id}
                                                className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground peer-data-[checked]:border-primary peer-data-[checked]:ring-2 peer-data-[checked]:ring-primary/20 peer-data-[checked]:bg-primary/5 cursor-pointer transition-all"
                                            >
                                                {option.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    ))}
                </div>
            )}

            {/* Stock Status */}
            {selectedVariant && (
                <div className="text-sm">
                    {isInStock ? (
                        <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                            <span className="h-2 w-2 rounded-full bg-green-600" />
                            {t('inStock')}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-destructive font-medium">
                            <span className="h-2 w-2 rounded-full bg-destructive" />
                            {t('outOfStock')}
                        </span>
                    )}
                </div>
            )}

            {/* Add to Cart Button. Hidden below lg, where the mobile purchase bar takes over. */}
            <div className="hidden lg:block pt-2 space-y-3">
                <Button
                    size="lg"
                    className="w-full h-12 text-base font-semibold rounded-lg"
                    disabled={!canAddToCart || isPending}
                    onClick={handleAddToCart}
                >
                    {purchaseIcon}
                    {purchaseLabel}
                </Button>
            </div>

            {/* SKU */}
            {selectedVariant && (
                <div className="text-xs text-muted-foreground">
                    {t('sku', {sku: selectedVariant.sku})}
                </div>
            )}

            {/* Mobile Purchase Bar. The product page reserves matching bottom padding. */}
            <section
                aria-label={t('purchaseBarLabel')}
                className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
            >
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold">
                            {selectedVariant ? (
                                <Price value={selectedVariant.priceWithTax} currencyCode={currencyCode}/>
                            ) : lowestVariantPrice !== null ? (
                                <>
                                    {t('from')}{' '}
                                    <Price value={lowestVariantPrice} currencyCode={currencyCode}/>
                                </>
                            ) : null}
                        </p>
                        {product.optionGroups.length > 0 && (
                            <p className="truncate text-xs text-muted-foreground">
                                {selectedOptionNames.length > 0
                                    ? selectedOptionNames.join(' · ')
                                    : t('chooseOptions', {
                                        options: product.optionGroups.map((group) => group.name).join(', '),
                                    })}
                            </p>
                        )}
                    </div>
                    <Button
                        size="lg"
                        className="h-12 shrink-0 text-base font-semibold rounded-lg"
                        disabled={!canAddToCart || isPending}
                        onClick={handleAddToCart}
                    >
                        {purchaseIcon}
                        {purchaseLabel}
                    </Button>
                </div>
            </section>
        </div>
    );
}
