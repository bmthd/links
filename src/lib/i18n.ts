// Locale definitions and the UI dictionary.
//
// Adding a locale means adding it to `locales` below and then fixing every
// resulting type error: `Localized` requires an entry for every locale, and
// `localeMeta` is `satisfies Record<Locale, ...>`, so a missing translation
// cannot compile. Everything else — the page route, hreflang links, the OG
// image and the language toggle — is derived from these two declarations.
//
// This module is imported both by the app and by build scripts running under
// Node's type stripping (scripts/generate-og.ts), so it must stay free of
// runtime imports and of non-erasable TypeScript syntax.

// The first entry is the default locale: it is served at `/` (no prefix) so
// the site's existing URL keeps working.
export const locales = ["ja", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = locales[0];

/** A plain string means "same in every locale" — used for proper nouns. */
export type Localized = string | { readonly [L in Locale]: string };

/** Resolves `Localized` values for one locale: `const t = translator(locale)`. */
export const translator =
  (locale: Locale) =>
  (value: Localized): string =>
    typeof value === "string" ? value : value[locale];

export type Translate = ReturnType<typeof translator>;

export const localeMeta = {
  ja: {
    // Shown inside the 44px round language toggle, so it has to stay short.
    short: "JA",
    // Labels the link that leads TO this locale, so it is written in this
    // locale — the usual convention for language switchers.
    switchLabel: "日本語で表示",
    ogLocale: "ja_JP",
  },
  en: {
    short: "EN",
    switchLabel: "View in English",
    ogLocale: "en_US",
  },
} as const satisfies Record<
  Locale,
  { readonly short: string; readonly switchLabel: string; readonly ogLocale: string }
>;

// Path of a locale's page. The default locale keeps the bare root path, and the
// others have NO trailing slash on purpose: wrangler.jsonc serves the site with
// `html_handling: "drop-trailing-slash"`, so `/en/` 301-redirects to `/en` —
// linking (and pointing canonical/hreflang at) the redirect target avoids a
// pointless hop.
export const localePath = (locale: Locale): string =>
  locale === defaultLocale ? "/" : `/${locale}`;

/** Public path of the OG image generated for a locale by scripts/generate-og.ts. */
export const ogImagePath = (locale: Locale): string =>
  locale === defaultLocale ? "/og.png" : `/og-${locale}.png`;

// Page copy that is not part of the link data (see links.ts for that).
export const ui = {
  description: {
    ja: "じょうげんのリンク集。SNS・Webアプリ・同人誌の入り口をまとめています。",
    en: "Jougen's link hub — social accounts, web apps and doujinshi, all in one place.",
  },
  themeToggle: {
    ja: "テーマ切り替え",
    en: "Toggle theme",
  },
  madeBy: {
    ja: "Made by",
    en: "Made by",
  },
} as const satisfies Record<string, Localized>;
