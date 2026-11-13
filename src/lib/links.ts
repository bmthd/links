import type { Localized } from "./i18n";

// Labels are `Localized`: a plain string is used as-is in every locale (service
// names such as X / GitHub / BOOTH), a per-locale record is translated.
// me: true marks an identity link (X/GitHub/Zenn/Blog). These get rel="me" and
// feed the JSON-LD sameAs array; WORKS/DOUJINSHI links do not.
export type LinkItem = { readonly label: Localized; readonly url: string; readonly me?: boolean };
// id names a section for the profile API (src/lib/profile-api.ts), so other
// sites can pick one (e.g. works) without relying on its position.
export type SectionId = "sns" | "works" | "doujinshi";
export type LinkSection = {
  readonly id: SectionId;
  readonly heading?: Localized;
  readonly items: readonly LinkItem[];
};

// The avatar is not listed here: profile-card.tsx imports it as a build-time
// data URI from src/generated/avatar.ts (see scripts/generate-images.ts).
export const profile = {
  name: { ja: "じょうげん", en: "Jougen" },
  bio: { ja: "フルスタック趣味人", en: "Full-stack hobbyist" },
} as const satisfies Record<string, Localized>;

export const sections: readonly LinkSection[] = [
  {
    id: "sns",
    items: [
      { label: "X", url: "https://x.com/j_ktwr", me: true },
      { label: "GitHub", url: "https://github.com/bmthd", me: true },
      { label: "Zenn", url: "https://zenn.dev/bmth", me: true },
      { label: "Blog", url: "https://blog.bmth.dev/", me: true },
    ],
  },
  {
    // WORKS / DOUJINSHI are decorative latin headings in the original design
    // and read the same in both locales, so they are left untranslated.
    id: "works",
    heading: "WORKS",
    items: [
      {
        label: { ja: "コミケお品書きまとめ", en: "Comiket Item List Roundup" },
        url: "https://oshinagaki.bmth.dev/",
      },
      {
        label: { ja: "楽天市場ポイント計算", en: "Rakuten Ichiba Point Calculator" },
        url: "https://point-sprint.bmth.dev/",
      },
      {
        label: { ja: "TCGドロー確率計算機", en: "TCG Draw Probability Calculator" },
        url: "https://tcg-tool.pages.dev/",
      },
      { label: { ja: "GitHub PRリスト", en: "GitHub PR List" }, url: "https://pr.bmth.dev/" },
      {
        label: { ja: "渋滞シミュレーション", en: "Traffic Jam Simulation" },
        url: "https://traffic-jam.bmth.dev/",
      },
    ],
  },
  {
    id: "doujinshi",
    heading: "DOUJINSHI",
    items: [
      { label: "BOOTH", url: "https://bluemethod.booth.pm/" },
      {
        // Melonbooks is the store's own english spelling.
        label: { ja: "メロンブックス", en: "Melonbooks" },
        url: "https://www.melonbooks.co.jp/circle/index.php?circle_id=107344",
      },
      {
        label: "DLsite",
        url: "https://www.dlsite.com/maniax/circle/profile/=/maker_id/RG01084474.html",
      },
    ],
  },
];

export const siteUrl = "https://links.bmth.dev/";

/** Absolute URL of a locale's page — used for canonical, hreflang and og:url. */
export const localeUrl = (path: string): string => new URL(path, siteUrl).href;

// Identity URLs for JSON-LD sameAs — kept in sync with the me:true links above.
export const sameAs = sections
  .flatMap((s) => s.items)
  .filter((i) => i.me)
  .map((i) => i.url);
