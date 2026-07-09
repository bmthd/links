// リンク切れ監視スクリプト
//
// URL抽出方式:
//   1. tsx 等の追加依存を増やさないため、まず `src/lib/links.ts` を素の ESM import で
//      読み込む。Node は v22.6 以降 `--experimental-strip-types` で、v23.6 以降は
//      デフォルトで .ts の型ストリップに対応しているため、通常はこの経路で
//      `sections` を直接取得できる(Node 24 のローカル検証済み)。
//   2. 万一 import が失敗した場合(古い Node 等で型ストリップが使えない場合)は、
//      links.ts をテキストとして読み込み `label: "..."` / `url: "..."` のペアを
//      正規表現で抽出するフォールバックに切り替える。
//
// 生存判定ルール:
//   - まず HEAD でリクエストし、リダイレクトは追従する(タイムアウト15秒)。
//   - HEAD がネットワークエラー、または 405 (Method Not Allowed) / 501 が返った
//     場合は GET で再試行する(HEAD 非対応サーバー対策)。
//   - 最終ステータスが 2xx/3xx なら OK。
//   - 403 / 405 / 429 は melonbooks 等の bot 対策・レート制限による誤検知の
//     可能性が高いため、fetch 自体が成立していれば「生存扱い(OK/bot対策疑い)」
//     とし、NG にはしない(サーバーが応答を返している = ドメイン・サイトは生存)。
//   - それ以外の 4xx/5xx、タイムアウト、DNS 解決失敗等は NG とし、
//     1件でもあれば結果表を出力したうえで exit 1。

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const LINKS_TS_URL = new URL("../src/lib/links.ts", import.meta.url);
const SELF_URL = "https://links.bmth.dev/";
const TIMEOUT_MS = 15_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; links-bmth-dev-linkcheck/1.0; +https://links.bmth.dev/)";

/** @returns {Promise<{ label: string, url: string }[]>} */
const collectTargets = async () => {
  /** @type {{ label: string, url: string }[]} */
  let targets;
  try {
    const mod = await import(LINKS_TS_URL.href);
    targets = mod.sections.flatMap((section) =>
      section.items.map((item) => ({ label: item.label, url: item.url })),
    );
    if (targets.length === 0) throw new Error("sections is empty");
  } catch (err) {
    console.warn(
      `[warn] links.ts の import に失敗したため正規表現フォールバックで抽出します: ${err.message}`,
    );
    const src = readFileSync(fileURLToPath(LINKS_TS_URL), "utf8");
    const labelUrlRe = /label:\s*"([^"]+)"\s*,\s*url:\s*"(https?:\/\/[^"]+)"/gs;
    targets = [...src.matchAll(labelUrlRe)].map((m) => ({ label: m[1], url: m[2] }));
    if (targets.length === 0) {
      throw new Error("正規表現フォールバックでも URL を抽出できませんでした");
    }
  }
  targets.push({ label: "Self", url: SELF_URL });
  return targets;
};

/**
 * @param {string} url
 * @param {"HEAD" | "GET"} method
 * @returns {Promise<{ ok: true, status: number } | { ok: false, error: string }>}
 */
const attemptFetch = async (url, method) => {
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": USER_AGENT },
    });
    return { ok: true, status: res.status };
  } catch (err) {
    const cause =
      err instanceof Error && err.cause instanceof Error ? ` (${err.cause.message})` : "";
    return { ok: false, error: (err instanceof Error ? err.message : String(err)) + cause };
  }
};

/** @param {{ label: string, url: string }} target */
const checkTarget = async ({ label, url }) => {
  let method = "HEAD";
  let result = await attemptFetch(url, method);

  if (!result.ok || result.status === 405 || result.status === 501) {
    method = "GET";
    result = await attemptFetch(url, method);
  }

  if (!result.ok) {
    return { label, url, method, status: "-", judgement: "NG", note: result.error };
  }

  const { status } = result;
  if (status >= 200 && status < 400) {
    return { label, url, method, status, judgement: "OK", note: "" };
  }
  if (status === 403 || status === 405 || status === 429) {
    return {
      label,
      url,
      method,
      status,
      judgement: "OK(bot対策疑い)",
      note: "403/405/429はbot対策の可能性が高いため生存扱い",
    };
  }
  return { label, url, method, status, judgement: "NG", note: `HTTP ${status}` };
};

const targets = await collectTargets();
const results = await Promise.all(targets.map(checkTarget));

console.table(results);

const ngResults = results.filter((r) => r.judgement === "NG");
if (ngResults.length > 0) {
  console.error(`\nNG: ${ngResults.length}件のリンク切れ疑いを検知しました`);
  for (const r of ngResults) {
    console.error(`- [${r.label}] ${r.url} : ${r.note}`);
  }
  process.exit(1);
}

console.log(`\nOK: 全${results.length}件のリンクが生存しています`);
