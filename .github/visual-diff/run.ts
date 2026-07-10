// PR ビルド (dist/public) と本番 (https://links.bmth.dev/) を同条件で撮影し、
// pixelmatch で差分画像と差分率を output/ に書き出す。
//
// Node 24 の type stripping で `node .github/visual-diff/run.ts` として直接
// 実行するため、erasable でない TS 構文 (enum / namespace / parameter
// properties など) は使わない。
//
// 撮影ノイズ対策:
// - `reducedMotion: "reduce"` でブロブアニメーション・transition を停止
//   (background.tsx / panda.config.ts の `_motionReduce` が反応する)
// - テーマは localStorage("theme") を addInitScript で先行注入して固定
//   (_root.tsx の THEME_INIT_SCRIPT が first paint 前に読む)
// - フォントフェード (data-fonts) は `document.fonts.ready` +
//   `<html data-fonts>` の消滅を明示的に待つ
import { createServer, type Server } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

type Theme = "dark" | "light";

interface DiffResult {
  diffPixels: number;
  totalPixels: number;
  ratio: number;
}

const here = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(here, "..", "..", "dist", "public");
const outDir = join(here, "output");
const prodUrl = process.env.PROD_URL ?? "https://links.bmth.dev/";

const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

function serveDist(): Promise<Server> {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://127.0.0.1").pathname);
      let file = normalize(pathname).replace(/^([/\\]|\.\.)+/, "");
      if (file === "" || file.endsWith("/")) file += "index.html";
      let body: Buffer;
      try {
        body = await readFile(join(distDir, file));
      } catch {
        file = join(file, "index.html");
        body = await readFile(join(distDir, file));
      }
      res.writeHead(200, { "content-type": mime[extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  // 空きポートに任せる (固定ポートは中断残骸などと衝突し EADDRINUSE になる)
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function capture(browser: Browser, url: string, theme: Theme): Promise<PNG> {
  // "HeadlessChrome" を含む既定 UA は Cloudflare の bot 判定に引っかかり得る
  // ため、同バージョンの通常 Chrome 相当へ揃える (PR/本番の両方に適用)。
  const major = browser.version().split(".")[0];
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: theme,
    userAgent: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36`,
  });
  try {
    await context.addInitScript((t: string) => localStorage.setItem("theme", t), theme);
    const page = await context.newPage();
    // `networkidle` は CI ランナーから本番 (Cloudflare) を開くとタイムアウト
    // することがあるため使わない。`load` + ページ本体の selector と
    // フォント読込完了の明示的な待機で描画の安定を担保する。
    await page.goto(url, { waitUntil: "load", timeout: 60_000 });
    await page.waitForSelector("main[data-fade]", { timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => !document.documentElement.hasAttribute("data-fonts"));
    // フェード完了後の描画安定待ち (reduced-motion で transition は無効だが念のため)
    await page.waitForTimeout(500);
    const buffer = await page.screenshot({ fullPage: true });
    return PNG.sync.read(buffer);
  } finally {
    await context.close();
  }
}

async function captureWithRetry(
  browser: Browser,
  url: string,
  theme: Theme,
  attempts = 3,
): Promise<PNG> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await capture(browser, url, theme);
    } catch (error) {
      lastError = error;
      console.warn(`capture failed (${url}, ${theme}, attempt ${attempt}/${attempts}): ${error}`);
    }
  }
  throw lastError;
}

function padTo(png: PNG, width: number, height: number): PNG {
  if (png.width === width && png.height === height) return png;
  const padded = new PNG({ width, height });
  PNG.bitblt(png, padded, 0, 0, png.width, png.height, 0, 0);
  return padded;
}

async function main(): Promise<void> {
  await mkdir(outDir, { recursive: true });
  const server = await serveDist();
  const localUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
  const browser = await chromium.launch();
  const results: Record<string, DiffResult> = {};

  for (const theme of ["dark", "light"] as const) {
    const pr = await captureWithRetry(browser, localUrl, theme);
    const prod = await captureWithRetry(browser, prodUrl, theme);
    const width = Math.max(pr.width, prod.width);
    const height = Math.max(pr.height, prod.height);
    const prPadded = padTo(pr, width, height);
    const prodPadded = padTo(prod, width, height);
    const diff = new PNG({ width, height });
    const diffPixels = pixelmatch(prPadded.data, prodPadded.data, diff.data, width, height, {
      threshold: 0.1,
    });
    const ratio = diffPixels / (width * height);
    results[theme] = { diffPixels, totalPixels: width * height, ratio };
    await writeFile(join(outDir, `pr-${theme}.png`), PNG.sync.write(prPadded));
    await writeFile(join(outDir, `prod-${theme}.png`), PNG.sync.write(prodPadded));
    await writeFile(join(outDir, `diff-${theme}.png`), PNG.sync.write(diff));
    console.log(`${theme}: ${(ratio * 100).toFixed(2)}% (${diffPixels}/${width * height}px)`);
  }

  await browser.close();
  server.close();
  await writeFile(join(outDir, "results.json"), `${JSON.stringify(results, null, 2)}\n`);
}

await main();
