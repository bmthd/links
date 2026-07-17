import { readFileSync, statSync } from "node:fs";

const html = readFileSync("dist/public/index.html", "utf8");

const required: string[] = [
  'lang="ja"',
  "じょうげん",
  "フルスタック趣味人",
  "https://x.com/j_ktwr",
  "https://github.com/bmthd",
  "https://zenn.dev/bmth",
  "https://blog.bmth.dev/",
  "https://point-sprint.bmth.dev/",
  "https://oshinagaki.bmth.dev/",
  "https://bluemethod.booth.pm/",
  "circle_id=107344",
  "WORKS",
  "DOUJINSHI",
  "og:title",
  "https://links.bmth.dev/og.png",
  "summary_large_image",
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
  console.error("MISSING:", missing);
  process.exit(1);
}

// scripts/generate-og.ts(build の前段)が生成した OGP 画像が配信物に含まれること
const ogSize = statSync("dist/public/og.png").size;
if (ogSize === 0) {
  console.error("EMPTY: dist/public/og.png");
  process.exit(1);
}

console.log("OK: all required content present");
