import {getLocale, hasLocale} from '@/platform/i18n/paraglide';
import {routing} from './routing';

/**
 * Safe wrapper around getLocale() that validates against routing config
 * and falls back to defaultLocale instead of returning undefined.
 */
export async function getRouteLocale(): Promise<string> {
    const loc = getLocale();
    return hasLocale(routing.locales, loc) ? loc : routing.defaultLocale;
}
