import {SITE_NAME, SITE_URL} from '@/config/metadata';
import {getLocale} from '@/paraglide/runtime';
import {toOgLocale} from '@/platform/i18n/locale-utils';

interface StorefrontHeadOptions {
    title: string;
    description?: string;
    path?: string;
    image?: string | null;
    noIndex?: boolean;
}

export function storefrontHead({title, description, path = '/', image, noIndex}: StorefrontHeadOptions) {
    const locale = getLocale();
    const localizedPath = `/${locale}${path === '/' ? '' : path}`;
    const canonical = new URL(localizedPath, SITE_URL).href;
    const absoluteTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    return {
        meta: [
            {title: absoluteTitle},
            ...(description ? [
                {name: 'description', content: description},
                {property: 'og:description', content: description},
            ] : []),
            {property: 'og:title', content: absoluteTitle},
            {property: 'og:type', content: 'website'},
            {property: 'og:locale', content: toOgLocale(locale)},
            {property: 'og:url', content: canonical},
            ...(image ? [{property: 'og:image', content: image}] : []),
            ...(noIndex ? [{name: 'robots', content: 'noindex, nofollow'}] : []),
        ],
        links: [
            {rel: 'canonical', href: canonical},
            {rel: 'alternate', hrefLang: 'en', href: new URL(`/en${path === '/' ? '' : path}`, SITE_URL).href},
            {rel: 'alternate', hrefLang: 'de', href: new URL(`/de${path === '/' ? '' : path}`, SITE_URL).href},
            {rel: 'alternate', hrefLang: 'x-default', href: new URL(`/en${path === '/' ? '' : path}`, SITE_URL).href},
        ],
    };
}
