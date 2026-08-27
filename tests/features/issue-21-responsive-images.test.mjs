import assert from 'node:assert/strict';
import test from 'node:test';
import {
    PRODUCT_CARD_IMAGE_WIDTHS,
    PRODUCT_CAROUSEL_CARD_SIZES,
    PRODUCT_GRID_CARD_SIZES,
    PRODUCT_HERO_IMAGE_WIDTHS,
    PRODUCT_HERO_SIZES,
    PRODUCT_THUMBNAIL_IMAGE_WIDTHS,
    PRODUCT_THUMBNAIL_SIZES,
    productCardImageUrl,
    productCardSrcSet,
    productHeroSrcSet,
    productThumbnailSrcSet,
} from '../../src/features/products/product-image.ts';

/**
 * Layout model for GitHub issue 21. It is derived from the Tailwind classes in
 * the storefront and is deliberately independent of the `sizes` strings under
 * test, so a layout change that is not mirrored in a `sizes` hint fails here.
 */
const TAILWIND_BREAKPOINTS = [640, 768, 1024, 1280, 1536];
const CONTAINER_PADDING = 32;

function containerContentWidth(viewport) {
    let maxWidth = viewport;
    for (const breakpoint of TAILWIND_BREAKPOINTS) {
        if (viewport >= breakpoint) maxWidth = breakpoint;
    }
    return Math.min(viewport, maxWidth) - CONTAINER_PADDING;
}

/** `grid-cols-1 lg:grid-cols-4 gap-8` shell, products in `lg:col-span-3`. */
function catalogColumnWidth(viewport) {
    const content = containerContentWidth(viewport);
    if (viewport < 1024) return content;
    return (3 * (content - 3 * 32)) / 4 + 2 * 32;
}

/** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` inside the catalog column. */
function gridCardWidth(viewport) {
    const columns = viewport >= 1024 ? 3 : viewport >= 640 ? 2 : 1;
    return (catalogColumnWidth(viewport) - 24 * (columns - 1)) / columns;
}

/** `basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4` with a `pl-2 md:pl-4` gutter. */
function carouselCardWidth(viewport) {
    const content = containerContentWidth(viewport);
    const gutter = viewport >= 768 ? 16 : 8;
    const slides = viewport >= 1280 ? 4 : viewport >= 1024 ? 3 : viewport >= 640 ? 2 : 1;
    return (content + gutter) / slides - gutter;
}

/** `grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12` on the detail page. */
function heroWidth(viewport) {
    const content = containerContentWidth(viewport);
    if (viewport < 1024) return content;
    return (content - 48) / 2;
}

/** `grid grid-cols-4 gap-3` below the hero image. */
function thumbnailWidth(viewport) {
    return (heroWidth(viewport) - 3 * 12) / 4;
}

/** Minimal `sizes` evaluator: first matching source-size wins, as in the spec. */
function resolveSizes(sizes, viewport) {
    for (const candidate of sizes.split(/,(?![^(]*\))/)) {
        const entry = candidate.trim();
        const match = /^(?:\(min-width:\s*(\d+)px\)\s+)?(.+)$/.exec(entry);
        assert.ok(match, `unparsable source size: ${entry}`);
        const [, minWidth, length] = match;
        if (minWidth && viewport < Number(minWidth)) continue;
        return resolveLength(length, viewport);
    }
    assert.fail(`no source size matched viewport ${viewport}: ${sizes}`);
}

function resolveLength(length, viewport) {
    const px = /^(\d+(?:\.\d+)?)px$/.exec(length);
    if (px) return Number(px[1]);
    const calc = /^calc\((\d+(?:\.\d+)?)vw\s*-\s*(\d+(?:\.\d+)?)(px|rem)\)$/.exec(length);
    assert.ok(calc, `unsupported length: ${length}`);
    const subtrahend = calc[3] === 'rem' ? Number(calc[2]) * 16 : Number(calc[2]);
    return (Number(calc[1]) / 100) * viewport - subtrahend;
}

/** Picks the narrowest candidate that covers the requested density, as browsers do. */
function selectedCandidate(widths, sizes, viewport, devicePixelRatio) {
    const required = resolveSizes(sizes, viewport) * devicePixelRatio;
    return widths.find((width) => width >= required) ?? widths[widths.length - 1];
}

const VIEWPORTS = [360, 412, 430, 639, 640, 700, 767, 768, 900, 1023, 1024, 1100, 1279, 1280, 1350, 1440, 1535, 1536, 1920, 2560];
const DENSITIES = [1, 1.75, 2, 3];

function assertSizesMatchLayout(name, sizes, renderedWidth) {
    for (const viewport of VIEWPORTS) {
        const hinted = resolveSizes(sizes, viewport);
        const rendered = renderedWidth(viewport);
        assert.ok(
            hinted >= rendered - 1,
            `${name}: sizes hints ${hinted}px at ${viewport}px viewport but the image renders at ${rendered}px`,
        );
        assert.ok(
            hinted <= rendered + 2,
            `${name}: sizes hints ${hinted}px at ${viewport}px viewport but the image only renders at ${rendered}px`,
        );
    }
}

function widestLadderStep(widths) {
    let widest = 1;
    for (let index = 1; index < widths.length; index++) {
        widest = Math.max(widest, widths[index] / widths[index - 1]);
    }
    return widest;
}

/**
 * Every reachable need must land on the narrowest candidate that covers it, so
 * the wasted pixels can never exceed one rung of the ladder. Needs outside the
 * ladder are skipped because no closer candidate exists.
 */
function assertCandidatesFit(name, widths, sizes, renderedWidth) {
    const maxOvershoot = widestLadderStep(widths);
    for (const viewport of VIEWPORTS) {
        for (const density of DENSITIES) {
            const required = renderedWidth(viewport) * density;
            const chosen = selectedCandidate(widths, sizes, viewport, density);
            if (required > widths[widths.length - 1]) continue;
            if (required < widths[0]) continue;
            assert.ok(
                chosen >= required,
                `${name}: picks ${chosen}px at ${viewport}px/${density}x but needs ${required.toFixed(0)}px`,
            );
            assert.ok(
                chosen / required <= maxOvershoot,
                `${name}: picks ${chosen}px at ${viewport}px/${density}x for a ${required.toFixed(0)}px need`,
            );
        }
    }
}

test('product card sizes match the grid and carousel layouts', () => {
    assertSizesMatchLayout('grid card', PRODUCT_GRID_CARD_SIZES, gridCardWidth);
    assertSizesMatchLayout('carousel card', PRODUCT_CAROUSEL_CARD_SIZES, carouselCardWidth);
});

test('detail image sizes match the hero and thumbnail layouts', () => {
    assertSizesMatchLayout('hero', PRODUCT_HERO_SIZES, heroWidth);
    assertSizesMatchLayout('thumbnail', PRODUCT_THUMBNAIL_SIZES, thumbnailWidth);
});

test('grid and carousel layouts need different card hints', () => {
    assert.notEqual(PRODUCT_GRID_CARD_SIZES, PRODUCT_CAROUSEL_CARD_SIZES);
});

test('candidate ladders cover every layout without oversized downloads', () => {
    assertCandidatesFit('grid card', PRODUCT_CARD_IMAGE_WIDTHS, PRODUCT_GRID_CARD_SIZES, gridCardWidth);
    assertCandidatesFit('carousel card', PRODUCT_CARD_IMAGE_WIDTHS, PRODUCT_CAROUSEL_CARD_SIZES, carouselCardWidth);
    assertCandidatesFit('hero', PRODUCT_HERO_IMAGE_WIDTHS, PRODUCT_HERO_SIZES, heroWidth);
    assertCandidatesFit('thumbnail', PRODUCT_THUMBNAIL_IMAGE_WIDTHS, PRODUCT_THUMBNAIL_SIZES, thumbnailWidth);
});

test('no consecutive candidate is more than 40% wider than the one below it', () => {
    for (const [name, widths] of [
        ['card', PRODUCT_CARD_IMAGE_WIDTHS],
        ['hero', PRODUCT_HERO_IMAGE_WIDTHS],
        ['thumbnail', PRODUCT_THUMBNAIL_IMAGE_WIDTHS],
    ]) {
        assert.ok(
            widestLadderStep(widths) <= 1.4,
            `${name} ladder has a step wider than 40%: ${widths.join(', ')}`,
        );
    }
});

test('the reported PageSpeed cases no longer over-download', () => {
    // Mobile: 412px viewport at 1.75x, previously 800px for a ~665px need.
    assert.equal(selectedCandidate(PRODUCT_CARD_IMAGE_WIDTHS, PRODUCT_GRID_CARD_SIZES, 412, 1.75), 720);
    // Desktop: 1350px viewport at 1x, previously 480px for a ~294px need.
    assert.equal(selectedCandidate(PRODUCT_CARD_IMAGE_WIDTHS, PRODUCT_GRID_CARD_SIZES, 1350, 1), 320);
});

test('card srcset keeps the WebP transform and pairs each candidate with its width', () => {
    const srcSet = productCardSrcSet('https://cdn.example/preview.jpg');
    const entries = srcSet.split(', ');
    assert.equal(entries.length, PRODUCT_CARD_IMAGE_WIDTHS.length);
    entries.forEach((entry, index) => {
        const width = PRODUCT_CARD_IMAGE_WIDTHS[index];
        assert.equal(
            entry,
            `https://cdn.example/preview.jpg?w=${width}&h=${width}&mode=crop&format=webp&q=75 ${width}w`,
        );
    });
});

test('transform parameters are appended to previews that already carry a query', () => {
    assert.equal(
        productCardImageUrl('https://cdn.example/preview.jpg?preset=medium', 320),
        'https://cdn.example/preview.jpg?preset=medium&w=320&h=320&mode=crop&format=webp&q=75',
    );
});

test('detail srcsets are generated for both the hero and the thumbnails', () => {
    const hero = productHeroSrcSet('https://cdn.example/preview.jpg');
    assert.equal(hero.split(', ').length, PRODUCT_HERO_IMAGE_WIDTHS.length);
    assert.ok(hero.endsWith('w=1440&h=1440&mode=crop 1440w'));

    const thumbnails = productThumbnailSrcSet('https://cdn.example/preview.jpg');
    assert.equal(thumbnails.split(', ').length, PRODUCT_THUMBNAIL_IMAGE_WIDTHS.length);
    assert.ok(thumbnails.startsWith('https://cdn.example/preview.jpg?w=96&h=96&mode=crop 96w'));
    assert.ok(thumbnails.endsWith('w=352&h=352&mode=crop 352w'));
});
