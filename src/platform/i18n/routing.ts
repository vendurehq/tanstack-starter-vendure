export const routing = ({
    locales: ['en', 'de'],
    defaultLocale: 'en',
}) as const;

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
    en: 'English',
    de: 'Deutsch',
};
