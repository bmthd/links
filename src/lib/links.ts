export type LinkItem = { readonly label: string; readonly url: string };
export type LinkSection = {
  readonly heading?: string;
  readonly items: readonly LinkItem[];
};

export const profile = {
  name: 'じょうげん',
  bio: 'フルスタック趣味人',
  avatar: '/avatar.png',
} as const;

export const sections: readonly LinkSection[] = [
  {
    items: [
      { label: 'X', url: 'https://x.com/j_ktwr' },
      { label: 'GitHub', url: 'https://github.com/bmthd' },
      { label: 'Zenn', url: 'https://zenn.dev/bmth' },
      { label: 'Blog', url: 'https://blog.bmth.dev/' },
    ],
  },
  {
    heading: 'WORKS',
    items: [
      { label: 'ポイントスプリント', url: 'https://point-sprint.bmth.dev/' },
      { label: 'お品書きまとめ', url: 'https://oshinagaki.bmth.dev/' },
    ],
  },
  {
    heading: 'DOUJINSHI',
    items: [
      { label: 'BOOTH', url: 'https://bluemethod.booth.pm/' },
      {
        label: 'メロンブックス',
        url: 'https://www.melonbooks.co.jp/circle/index.php?circle_id=107344',
      },
    ],
  },
];
