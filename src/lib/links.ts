export type LinkItem = { readonly label: string; readonly url: string };
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
      { label: "X", url: "https://x.com/j_ktwr" },
      { label: "GitHub", url: "https://github.com/bmthd" },
      { label: "Zenn", url: "https://zenn.dev/bmth" },
      { label: "Blog", url: "https://blog.bmth.dev/" },
    ],
  },
  {
    heading: "WORKS",
    items: [
      { label: "コミケお品書きまとめ", url: "https://oshinagaki.bmth.dev/" },
      { label: "楽天ポイント計算（ポイントスプリント）", url: "https://point-sprint.bmth.dev/" },
      { label: "GitHub PRリスト", url: "https://pr.bmth.dev/" },
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
