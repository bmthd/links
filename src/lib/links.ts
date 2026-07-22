// me: true marks an identity link (X/GitHub/Zenn/Blog). These get rel="me" and
// feed the JSON-LD sameAs array; WORKS/DOUJINSHI links do not.
export type LinkItem = { readonly label: string; readonly url: string; readonly me?: boolean };
export type LinkSection = {
  readonly heading?: string;
  readonly items: readonly LinkItem[];
};

// The avatar is not listed here: profile-card.tsx imports it as a build-time
// data URI from src/generated/avatar.ts (see scripts/generate-images.ts).
export const profile = {
  name: "じょうげん",
  bio: "フルスタック趣味人",
} as const;

export const sections: readonly LinkSection[] = [
  {
    items: [
      { label: "X", url: "https://x.com/j_ktwr", me: true },
      { label: "GitHub", url: "https://github.com/bmthd", me: true },
      { label: "Zenn", url: "https://zenn.dev/bmth", me: true },
      { label: "Blog", url: "https://blog.bmth.dev/", me: true },
    ],
  },
  {
    heading: "WORKS",
    items: [
      { label: "ポイントスプリント", url: "https://point-sprint.bmth.dev/" },
      { label: "お品書きまとめ", url: "https://oshinagaki.bmth.dev/" },
      { label: "PRリスト", url: "https://pr.bmth.dev/" },
      { label: "渋滞シミュレーション", url: "https://traffic-jam.bmth.dev/" },
    ],
  },
  {
    heading: "DOUJINSHI",
    items: [
      { label: "BOOTH", url: "https://bluemethod.booth.pm/" },
      {
        label: "メロンブックス",
        url: "https://www.melonbooks.co.jp/circle/index.php?circle_id=107344",
      },
    ],
  },
];

export const siteUrl = "https://links.bmth.dev/";

// Identity URLs for JSON-LD sameAs — kept in sync with the me:true links above.
export const sameAs = sections
  .flatMap((s) => s.items)
  .filter((i) => i.me)
  .map((i) => i.url);
