// リンク切れ監視スクリプト(node scripts/check-links.ts で実行)
//
// Node 24 は型ストリップにより .ts を直接実行できるため、tsx 等の追加依存は不要。
// erasable でない構文(enum / namespace / パラメータプロパティ等)は使わない。
//
// URL抽出方式:
//   1. まず `src/lib/links.ts` を動的 import で読み込み、`sections` から全URLを取得する
//      (tsc の moduleResolution 制約を避けるため URL 経由の動的 import を使用)。
//   2. 万一 import が失敗した場合(型ストリップ非対応の古い Node 等)は、
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
import process from "node:process";
import { fileURLToPath } from "node:url";

type Target = { label: string; url: string };
type Method = "HEAD" | "GET";
type FetchResult = { ok: true; status: number } | { ok: false; error: string };
type Judgement = "OK" | "OK(bot対策疑い)" | "NG";
type CheckResult = {
  label: string;
  url: string;
  method: Method;
  status: number | "-";
  judgement: Judgement;
  note: string;
};
type LinksModule = {
  sections: readonly { items: readonly Target[] }[];
};

const LINKS_TS_URL = new URL("../src/lib/links.ts", import.meta.url);
const SELF_URL = "https://links.bmth.dev/";
const TIMEOUT_MS = 15_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; links-bmth-dev-linkcheck/1.0; +https://links.bmth.dev/)";

const errorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    const cause = err.cause instanceof Error ? ` (${err.cause.message})` : "";
    return err.message + cause;
  }
  return String(err);
};

const collectTargets = async (): Promise<Target[]> => {
  let targets: Target[];
  try {
    const mod = (await import(LINKS_TS_URL.href)) as LinksModule;
    targets = mod.sections.flatMap((section) =>
      section.items.map((item) => ({ label: item.label, url: item.url })),
    );
    if (targets.length === 0) throw new Error("sections is empty");
  } catch (err) {
    console.warn(
      `[warn] links.ts の import に失敗したため正規表現フォールバックで抽出します: ${errorMessage(err)}`,
    );
    const src = readFileSync(fileURLToPath(LINKS_TS_URL), "utf8");
    const labelUrlRe = /label:\s*"([^"]+)"\s*,\s*url:\s*"(https?:\/\/[^"]+)"/gs;
    targets = [...src.matchAll(labelUrlRe)].map((m) => ({
      label: m[1] ?? "",
      url: m[2] ?? "",
    }));
    if (targets.length === 0) {
      throw new Error("正規表現フォールバックでも URL を抽出できませんでした");
    }
  }
  targets.push({ label: "Self", url: SELF_URL });
  return targets;
};

const attemptFetch = async (url: string, method: Method): Promise<FetchResult> => {
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": USER_AGENT },
    });
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
};

const checkTarget = async ({ label, url }: Target): Promise<CheckResult> => {
  let method: Method = "HEAD";
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
