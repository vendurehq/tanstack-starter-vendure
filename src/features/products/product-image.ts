/**
 * Responsive candidates and `sizes` hints for product imagery.
 *
 * The hints are written as descending `min-width` queries so that they align
 * exactly with the Tailwind breakpoints (640, 768, 1024, 1280, 1536) used by
 * the layouts. Every value below is the rendered CSS width of the image box,
 * derived from these layout facts (Tailwind v4 defaults, 16px root font):
 *
 * - Page shell `container mx-auto px-4`: content width is
 *   `min(100vw, breakpoint) - 32px`, so it caps at 1504px from 1536px up.
 * - Catalog grid: shell `grid-cols-1 lg:grid-cols-4 gap-8` with the products
 *   in `lg:col-span-3`, then cards in `grid-cols-1 sm:grid-cols-2
 *   lg:grid-cols-3 gap-6`.
 * - Product carousel: slides `basis-full sm:basis-1/2 lg:basis-1/3
 *   xl:basis-1/4` with an 8px gutter (16px from 768px up).
 * - Product detail: `grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12`, with the
 *   thumbnails in `grid-cols-4 gap-3` below the hero image.
 */

export const PRODUCT_CARD_IMAGE_WIDTHS = [
	240, 320, 400, 480, 576, 640, 720, 800,
] as const;

export const PRODUCT_HERO_IMAGE_WIDTHS = [
	480, 640, 768, 960, 1200, 1440,
] as const;

/** Capped at 2x of the widest thumbnail box; a 173px box needs no more. */
export const PRODUCT_THUMBNAIL_IMAGE_WIDTHS = [
	96, 128, 176, 224, 288, 352,
] as const;

/** Rendered card width: 358, 294, 230, 356, 292, then full bleed. */
export const PRODUCT_GRID_CARD_SIZES =
	"(min-width: 1536px) 358px, (min-width: 1280px) 294px, (min-width: 1024px) 230px, (min-width: 768px) 356px, (min-width: 640px) 292px, calc(100vw - 2rem)";

/** Rendered card width: 364, 300, 320, 360, 300, then full bleed. */
export const PRODUCT_CAROUSEL_CARD_SIZES =
	"(min-width: 1536px) 364px, (min-width: 1280px) 300px, (min-width: 1024px) 320px, (min-width: 768px) 360px, (min-width: 640px) 300px, calc(100vw - 2rem)";

/** Rendered hero width: 728, 600, 472, 736, 608, then full bleed. */
export const PRODUCT_HERO_SIZES =
	"(min-width: 1536px) 728px, (min-width: 1280px) 600px, (min-width: 1024px) 472px, (min-width: 768px) 736px, (min-width: 640px) 608px, calc(100vw - 2rem)";

/** Rendered thumbnail width: 173, 141, 109, 175, 143, then a quarter row. */
export const PRODUCT_THUMBNAIL_SIZES =
	"(min-width: 1536px) 173px, (min-width: 1280px) 141px, (min-width: 1024px) 109px, (min-width: 768px) 175px, (min-width: 640px) 143px, calc(25vw - 17px)";

function transformedAssetUrl(preview: string, params: string) {
	const separator = preview.includes("?") ? "&" : "?";
	return `${preview}${separator}${params}`;
}

export function productCardImageUrl(preview: string, width: number) {
	return transformedAssetUrl(
		preview,
		`w=${width}&h=${width}&mode=crop&format=webp&q=75`,
	);
}

export function productDetailImageUrl(preview: string, width: number) {
	return transformedAssetUrl(preview, `w=${width}&h=${width}&mode=crop`);
}

function srcSet(
	preview: string,
	widths: readonly number[],
	toUrl: (preview: string, width: number) => string,
) {
	return widths.map((width) => `${toUrl(preview, width)} ${width}w`).join(", ");
}

export function productCardSrcSet(preview: string) {
	return srcSet(preview, PRODUCT_CARD_IMAGE_WIDTHS, productCardImageUrl);
}

export function productHeroSrcSet(preview: string) {
	return srcSet(preview, PRODUCT_HERO_IMAGE_WIDTHS, productDetailImageUrl);
}

export function productThumbnailSrcSet(preview: string) {
	return srcSet(preview, PRODUCT_THUMBNAIL_IMAGE_WIDTHS, productDetailImageUrl);
}
