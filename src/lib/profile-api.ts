// The public profile API: the same data the page renders, as JSON, so other
// sites (e.g. point-sprint's about page) can show the profile and link here
// without keeping their own copy. scripts/generate-api.ts writes it to
// public/api/profile.json at build time.
//
// Imported by that script under Node's type stripping, so imports carry the
// .ts extension and only erasable TypeScript syntax is used.

import { type Locale, type Localized, locales, translator } from "./i18n.ts";
import { sameAs, sections, siteUrl, profile } from "./links.ts";

/** Public path of the generated JSON. */
export const profileApiPath = "/api/profile.json";

/** Bump when a field is removed or changes meaning; adding fields keeps it. */
export const profileApiVersion = 1;

/** Avatar variants that scripts/generate-images.ts writes to public/. */
export const avatarFiles = [
  { path: "/avatar-192.webp", width: 192, height: 192, type: "image/webp" },
  { path: "/avatar-96.png", width: 96, height: 96, type: "image/png" },
] as const;

type PerLocale = { readonly [L in Locale]: string };

// Always spell out every locale, so consumers never have to know that a plain
// string in links.ts means "same in every locale".
const perLocale = (value: Localized): PerLocale =>
  Object.fromEntries(locales.map((l) => [l, translator(l)(value)])) as PerLocale;

export const buildProfileApi = () => ({
  version: profileApiVersion,
  name: perLocale(profile.name),
  bio: perLocale(profile.bio),
  url: siteUrl,
  avatar: avatarFiles.map((a) => ({ ...a, url: new URL(a.path, siteUrl).href })),
  sameAs,
  sections: sections.map((s) => ({
    id: s.id,
    heading: s.heading === undefined ? null : perLocale(s.heading),
    items: s.items.map((i) => ({ label: perLocale(i.label), url: i.url, me: i.me === true })),
  })),
});
