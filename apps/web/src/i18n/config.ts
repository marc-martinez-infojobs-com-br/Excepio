export const locales = ['ca', 'es', 'en'] as const;

export const defaultLocale = 'es' as const;

export type Locale = (typeof locales)[number];
