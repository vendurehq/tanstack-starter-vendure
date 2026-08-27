import type { ResultOf } from 'gql.tada';
import type {GetProductDetailQuery} from './graphql';

type ProductDetail = NonNullable<ResultOf<typeof GetProductDetailQuery>['product']>;

/**
 * Vendure 3.6 made ProductOptionGroup/ProductOption shared and channel-aware
 * (vendure#4469): a product's `optionGroups` now returns every option in the
 * (possibly shared) group, including options for which this product has no
 * variant. Rendering those directly produces "phantom" option buttons with no
 * price, no stock status, and a permanently disabled add-to-cart.
 *
 * This returns the option groups reduced to the options actually used by one of
 * the product's variants, dropping any group left with no options.
 */
export function getDisplayOptionGroups(product: ProductDetail): ProductDetail['optionGroups'] {
    const usedOptionIds = new Set(
        product.variants.flatMap((variant) => variant.options.map((option) => option.id)),
    );

    return product.optionGroups
        .map((group) => ({
            ...group,
            options: group.options.filter((option) => usedOptionIds.has(option.id)),
        }))
        .filter((group) => group.options.length > 0);
}

/**
 * Names of the options the customer has already chosen, in option group order.
 * The mobile purchase bar shows these so the pinned action states which
 * configuration it adds to the cart.
 */
export function getSelectedOptionNames(
    optionGroups: ReadonlyArray<{id: string; options: ReadonlyArray<{id: string; name: string}>}>,
    selectedOptions: Record<string, string>,
): string[] {
    return optionGroups.flatMap((group) => {
        const selectedId = selectedOptions[group.id];
        const option = group.options.find((candidate) => candidate.id === selectedId);
        return option ? [option.name] : [];
    });
}

/**
 * Lowest variant price, or null when the product has no variants. The mobile
 * purchase bar shows it as a "from" price until the customer picks a variant.
 */
export function getLowestVariantPrice(variants: ReadonlyArray<{priceWithTax: number}>): number | null {
    if (variants.length === 0) return null;
    return variants.reduce((lowest, variant) => Math.min(lowest, variant.priceWithTax), Number.POSITIVE_INFINITY);
}
