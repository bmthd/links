import { readFileSync } from "node:fs";

const html = readFileSync("dist/public/index.html", "utf8");

const required = [
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
  "/avatar.png",
];

const missing = required.filter((s) => !html.includes(s));
if (missing.length > 0) {
  console.error("MISSING:", missing);
  process.exit(1);
}
console.log("OK: all required content present");
