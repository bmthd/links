// ビルド成果物にロケールごとの必須コンテンツが揃っているかを検証する。
// 期待値は src/lib のロケール定義・リンクデータから導出するため、ロケールを
// 増やしてもこのスクリプトは変更不要(検証対象が自動で増える)。
//
// `node scripts/check-build.ts` として直接実行するため、erasable な TS 構文
// のみを使う(src からの import は拡張子まで明示する)。

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { localePath, locales, ogImagePath, translator, ui } from "../src/lib/i18n.ts";
import { localeUrl, profile, sections } from "../src/lib/links.ts";

const failures: string[] = [];

for (const locale of locales) {
  const t = translator(locale);
  const htmlPath = join("dist/public", localePath(locale), "index.html");
  const html = readFileSync(htmlPath, "utf8");

  const required: string[] = [
    // scripts/optimize-html.ts が非既定ロケールの lang を書き換えたこと
    `lang="${locale}"`,
    t(profile.name),
    t(profile.bio),
    t(ui.description),
    // 全セクションの見出し・リンク先・ラベルが当該ロケールで出ていること
    ...sections.flatMap((s) => [
      ...(s.heading ? [t(s.heading)] : []),
      ...s.items.flatMap((i) => [i.url, t(i.label)]),
    ]),
    "og:title",
    localeUrl(ogImagePath(locale)),
    "summary_large_image",
    // 他ロケールへの言語切替リンクと hreflang(x-default は既定ロケール)
    ...locales.filter((other) => other !== locale).map((other) => `href="${localePath(other)}"`),
    ...locales.map((other) => localeUrl(localePath(other))),
    'rel="alternate"',
    "x-default",
    'rel="canonical"',
    // scripts/generate-images.ts が生成したアバターの data URI がインライン
    // されていること
    "data:image/webp;base64,",
    "/avatar-96.png",
    // scripts/optimize-html.ts(build の後段)がスタイルをインライン化し、
    // hydration 用 JS を load 後まで遅延させたこと
    "<style>",
    'addEventListener("load"',
  ];

  const missing = required.filter((s) => !html.includes(s));
  if (missing.length > 0) {
    failures.push(`MISSING in ${htmlPath}: ${JSON.stringify(missing)}`);
  }

  // scripts/generate-og.ts(build の前段)が生成した OGP 画像が配信物に含まれること
  const ogPath = join("dist/public", ogImagePath(locale));
  if (statSync(ogPath).size === 0) {
    failures.push(`EMPTY: ${ogPath}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(`OK: all required content present for ${locales.join(", ")}`);
