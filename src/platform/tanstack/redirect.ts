export function safeInternalRedirect(value: string | undefined, fallback = '/') {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
    try {
        const url = new URL(value, 'https://storefront.invalid');
        return url.origin === 'https://storefront.invalid' ? `${url.pathname}${url.search}${url.hash}` : fallback;
    } catch {
        return fallback;
    }
}
