# links.bmth.dev Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** litlink風の1ページ静的リンク集 links.bmth.dev を Waku + Panda CSS で構築し、Cloudflare Workers 静的アセットとして配信する。

**Architecture:** Waku のサーバーなしRSC(全ページ `render: 'static'`)で純静的HTMLを生成。スタイルは Panda CSS(ゼロランタイム、postcss統合)。リンクデータは `src/lib/links.ts` の型付き配列1ファイルに集約し、ビルド出力の検証スクリプトで全リンクの存在を担保する。デプロイは GitHub Actions → `wrangler deploy`(assets-only、Workerなし)。

**Tech Stack:** Waku (latest) / React 19 / Panda CSS / @fontsource/m-plus-rounded-1c / Vitest / Wrangler / pnpm 11 / Node 24+(ローカルは25)

**仕様書:** `docs/superpowers/specs/2026-07-08-links-site-design.md`
**デザイン参照モック:** `docs/reference/final-liquid-mock.html`(CSSの見た目はこれに寄せる。値が計画と食い違う場合はモックを優先)

## Global Constraints

- 作業ディレクトリ: `/mnt/c/workspace/links`(git初期化済み、mainブランチ)
- 表示名「じょうげん」、bio「フルスタック趣味人」、日本語のみ、フッターなし
- 全リンク `target="_blank" rel="noopener"`
- 背景(ダーク基準): `linear-gradient(160deg, #1D4E89 0%, #173A6B 45%, #0A1830 100%)`
- ライト背景: `linear-gradient(160deg, #BFE0FF 0%, #DCEEFF 45%, #F4FAFF 100%)`(`prefers-color-scheme` 追従、ダークが基準)
- アクセント: `#38BDF8`(サブ `#5B7BFF`)
- ガラス: `background: rgba(255,255,255,.12)` / `backdrop-filter: blur(16px) saturate(180%)` / `border: 1px solid rgba(255,255,255,.3)` / shadow `inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 1px rgba(255,255,255,.08), 0 8px 24px rgba(0,0,0,.25)`
- ボタン: ピル型(radius 999px)、アイコンなし中央揃え、白文字+薄いテキストシャドウ、hoverで scale 1.03 + わずかに明るく
- セクション見出し: `WORKS` / `DOUJINSHI`、中央揃え、letter-spacing .25em、ダーク時 `#BFE8FF`
- 背景ブロブ: CSS keyframes のみ、9〜11秒周期、`prefers-reduced-motion: reduce` で停止
- アニメーション・動的取得・アナリティクスの追加禁止(YAGNI)
- コミットは各タスク末尾で必ず行う。メッセージ末尾に `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: プロジェクト土台(Waku が起動しビルドできる)

**Files:**

- Create: `package.json`, `tsconfig.json`, `.gitignore`, `src/pages/index.tsx`, `src/pages/_layout.tsx`
- Create: `public/avatar.png`(GitHubアバターを取得して同梱)

**Interfaces:**

- Produces: `pnpm dev` / `pnpm build` が動く Waku プロジェクト。後続タスクは `src/pages/` と `src/components/` に追記する。

- [ ] **Step 1: package.json と .gitignore を作成**

`package.json`:

```json
{
  "name": "links",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "waku dev",
    "build": "waku build",
    "preview": "waku start",
    "test": "vitest run",
    "check-build": "node scripts/check-build.mjs"
  }
}
```

`.gitignore`:

```
node_modules/
dist/
src/styled-system/
.wrangler/
*.log
```

- [ ] **Step 2: 依存をインストール**

```bash
cd /mnt/c/workspace/links
pnpm add waku react react-dom @fontsource/m-plus-rounded-1c
pnpm add -D typescript @types/react @types/react-dom @pandacss/dev vitest wrangler
```

Expected: `package.json` に依存が追記され `pnpm-lock.yaml` 生成。

- [ ] **Step 3: tsconfig.json を作成**

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "react-jsx",
    "types": ["react/experimental"]
  },
  "include": ["src", "scripts"]
}
```

- [ ] **Step 4: 仮ページとレイアウトを作成**

`src/pages/_layout.tsx`:

```tsx
import type { ReactNode } from "react";

export default async function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
```

`src/pages/index.tsx`:

```tsx
export default async function HomePage() {
  return <main>hello links</main>;
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
```

- [ ] **Step 5: dev サーバーとビルドを確認**

```bash
pnpm build
grep -c "hello links" dist/public/index.html
```

Expected: ビルド成功、grep が `1` 以上を出力。`dist/public/index.html` が存在すること(出力先が違う場合は実際のパスを確認し、Task 5 の wrangler.jsonc と Task 4 の scripts/check-build.mjs のパスを合わせて修正する)。

- [ ] **Step 6: アバターを取得して同梱**

```bash
mkdir -p public
curl -fsSL https://github.com/bmthd.png -o public/avatar.png
file public/avatar.png
```

Expected: `PNG image data` または `JPEG image data`(GitHubはpng拡張子でJPEGを返すことがある。その場合もファイル名は avatar.png のままでよい)。

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "feat: Waku プロジェクト土台を作成"
```

---

### Task 2: Panda CSS 設定(デザイントークンとガラス表現)

**Files:**

- Create: `panda.config.ts`, `postcss.config.cjs`, `src/styles.css`
- Modify: `src/pages/_layout.tsx`

**Interfaces:**

- Produces:
  - `src/styled-system/css` から `css`, `cx` 関数(後続タスクの全コンポーネントが使用)
  - グローバルクラス `.glass`(ガラス表現一式。ボタン・カードは `cx('glass', css({...}))` で使う)
  - セマンティックトークン: `colors.text` / `colors.textDim` / `colors.accent` / `gradients.page`
  - keyframes: `float1`(9s), `float2`(11s), `float3`(10s)

- [ ] **Step 1: postcss.config.cjs を作成**

```js
module.exports = {
  plugins: {
    "@pandacss/dev/postcss": {},
  },
};
```

- [ ] **Step 2: panda.config.ts を作成**

```ts
import { defineConfig, defineGlobalStyles } from "@pandacss/dev";

const globalCss = defineGlobalStyles({
  body: {
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
    minHeight: "100dvh",
    color: "text",
    backgroundImage: "page",
    backgroundAttachment: "fixed",
  },
  ".glass": {
    background: "rgba(255,255,255,.12)",
    backdropFilter: "blur(16px) saturate(180%)",
    border: "1px solid rgba(255,255,255,.3)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 1px rgba(255,255,255,.08), 0 8px 24px rgba(0,0,0,.25)",
    "@media (prefers-color-scheme: light)": {
      background: "rgba(255,255,255,.45)",
      border: "1px solid rgba(255,255,255,.65)",
    },
    "@supports not (backdrop-filter: blur(1px))": {
      background: "rgba(30,62,110,.92)",
      "@media (prefers-color-scheme: light)": {
        background: "rgba(255,255,255,.92)",
      },
    },
  },
});

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{ts,tsx}"],
  exclude: ["./src/styled-system/**"],
  outdir: "src/styled-system",
  globalCss,
  theme: {
    extend: {
      keyframes: {
        float1: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(28px, -36px)" },
        },
        float2: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-32px, 24px)" },
        },
        float3: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(20px, 32px)" },
        },
      },
      semanticTokens: {
        colors: {
          text: {
            value: { base: "rgba(255,255,255,.92)", _osLight: "#0F2A4A" },
          },
          textDim: {
            value: { base: "#BFE8FF", _osLight: "#33557F" },
          },
          accent: { value: "#38BDF8" },
          accentSub: { value: "#5B7BFF" },
        },
        gradients: {
          page: {
            value: {
              base: "linear-gradient(160deg, #1D4E89 0%, #173A6B 45%, #0A1830 100%)",
              _osLight: "linear-gradient(160deg, #BFE0FF 0%, #DCEEFF 45%, #F4FAFF 100%)",
            },
          },
        },
      },
    },
  },
});
```

- [ ] **Step 3: prepare スクリプトを追加**

`package.json` の `scripts` に追加(インストール時に codegen が走り、CIでも `src/styled-system/` が確実に生成される):

```json
"prepare": "panda codegen"
```

- [ ] **Step 4: src/styles.css を作成し、レイアウトで読み込む**

`src/styles.css`:

```css
@layer reset, base, tokens, recipes, utilities;
```

`src/pages/_layout.tsx` を以下に置き換え:

```tsx
import type { ReactNode } from "react";
import "@fontsource/m-plus-rounded-1c/400.css";
import "@fontsource/m-plus-rounded-1c/700.css";
import "../styles.css";

export default async function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
```

- [ ] **Step 5: codegen とビルドを確認**

```bash
pnpm panda codegen
pnpm build
grep -o "linear-gradient(160deg" dist/public/assets/*.css | head -2
```

Expected: codegen が `src/styled-system/` を生成、ビルド成功、grep で背景グラデーションが出力CSSに含まれる(CSSの出力パスが違う場合は `grep -r "linear-gradient(160deg" dist/public` で確認)。

- [ ] **Step 6: コミット**

```bash
git add -A
git commit -m "feat: Panda CSS を設定(Liquid Glass トークン・keyframes・グローバルスタイル)"
```

---

### Task 3: リンクデータとテスト

**Files:**

- Create: `src/lib/links.ts`
- Test: `src/lib/links.test.ts`

**Interfaces:**

- Produces:

  ```ts
  export type LinkItem = { readonly label: string; readonly url: string };
  export type LinkSection = { readonly heading?: string; readonly items: readonly LinkItem[] };
  export const profile: { readonly name: string; readonly bio: string; readonly avatar: string };
  export const sections: readonly LinkSection[];
  ```

  Task 4 のページ・コンポーネントはこれのみを消費する。

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/links.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { profile, sections } from "./links";

const allItems = sections.flatMap((s) => s.items);

describe("profile", () => {
  it("名前・bio・アバターが仕様どおり", () => {
    expect(profile.name).toBe("じょうげん");
    expect(profile.bio).toBe("フルスタック趣味人");
    expect(profile.avatar).toBe("/avatar.png");
  });
});

describe("sections", () => {
  it("SNS(見出しなし)→ WORKS → DOUJINSHI の3セクション", () => {
    expect(sections.map((s) => s.heading)).toEqual([undefined, "WORKS", "DOUJINSHI"]);
    expect(sections.map((s) => s.items.length)).toEqual([4, 2, 2]);
  });

  it("全URLが有効な https で重複なし", () => {
    for (const { url } of allItems) {
      expect(new URL(url).protocol).toBe("https:");
    }
    expect(new Set(allItems.map((i) => i.url)).size).toBe(allItems.length);
  });

  it("ラベルが空でなく重複なし", () => {
    for (const { label } of allItems) {
      expect(label.trim().length).toBeGreaterThan(0);
    }
    expect(new Set(allItems.map((i) => i.label)).size).toBe(allItems.length);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
pnpm test
```

Expected: FAIL(`Cannot find module './links'` 相当のエラー)

- [ ] **Step 3: links.ts を実装**

`src/lib/links.ts`:

```ts
export type LinkItem = { readonly label: string; readonly url: string };
export type LinkSection = {
  readonly heading?: string;
  readonly items: readonly LinkItem[];
};

export const profile = {
  name: "じょうげん",
  bio: "フルスタック趣味人",
  avatar: "/avatar.png",
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
      { label: "ポイントスプリント", url: "https://point-sprint.bmth.dev/" },
      { label: "お品書きまとめ", url: "https://oshinagaki.bmth.dev/" },
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
```

- [ ] **Step 4: テストが通ることを確認**

```bash
pnpm test
```

Expected: PASS(4 tests)

- [ ] **Step 5: コミット**

```bash
git add src/lib/links.ts src/lib/links.test.ts
git commit -m "feat: リンクデータとバリデーションテストを追加"
```

---

### Task 4: UI コンポーネントとページ本体

**Files:**

- Create: `src/components/background.tsx`, `src/components/profile-card.tsx`, `src/components/link-section.tsx`
- Modify: `src/pages/index.tsx`
- Test: `scripts/check-build.mjs`(ビルド出力の検証)

**Interfaces:**

- Consumes: Task 3 の `profile` / `sections`、Task 2 の `css`/`cx`/`.glass`/トークン/keyframes
- Produces: 完成した1ページ。`pnpm check-build` がリンク全件の存在を検証する。

- [ ] **Step 1: 失敗するビルド検証スクリプトを書く**

`scripts/check-build.mjs`:

```js
import { readFileSync } from "node:fs";

const html = readFileSync("dist/public/index.html", "utf8");

const required = [
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
```

- [ ] **Step 2: 失敗を確認**

```bash
pnpm build && pnpm check-build
```

Expected: `MISSING: [...]` で exit 1(まだ仮ページのため)

- [ ] **Step 3: 背景コンポーネントを実装**

`src/components/background.tsx`:

```tsx
import { css } from "../styled-system/css";

const blobBase = {
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(90px)",
  opacity: 0.5,
  _motionReduce: { animation: "none" },
} as const;

export function Background() {
  return (
    <div
      aria-hidden
      className={css({
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: -1,
      })}
    >
      <div
        className={css({
          ...blobBase,
          top: "8%",
          left: "12%",
          width: "340px",
          height: "340px",
          background: "accent",
          animation: "float1 9s ease-in-out infinite",
        })}
      />
      <div
        className={css({
          ...blobBase,
          top: "45%",
          right: "8%",
          width: "300px",
          height: "300px",
          background: "accentSub",
          animation: "float2 11s ease-in-out infinite",
        })}
      />
      <div
        className={css({
          ...blobBase,
          bottom: "5%",
          left: "25%",
          width: "260px",
          height: "260px",
          background: "accent",
          opacity: 0.35,
          animation: "float3 10s ease-in-out infinite",
        })}
      />
    </div>
  );
}
```

- [ ] **Step 4: プロフィールとリンクセクションを実装**

`src/components/profile-card.tsx`:

```tsx
import { css } from "../styled-system/css";
import { profile } from "../lib/links";

export function ProfileCard() {
  return (
    <header
      className={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3",
        textAlign: "center",
      })}
    >
      <img
        src={profile.avatar}
        alt=""
        width={96}
        height={96}
        className={css({
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,.5)",
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        })}
      />
      <h1 className={css({ fontSize: "2xl", fontWeight: "700" })}>{profile.name}</h1>
      <p className={css({ color: "textDim", fontSize: "sm" })}>{profile.bio}</p>
    </header>
  );
}
```

`src/components/link-section.tsx`:

```tsx
import { css, cx } from "../styled-system/css";
import type { LinkSection } from "../lib/links";

export function LinkSectionBlock({ section }: { section: LinkSection }) {
  return (
    <section className={css({ display: "flex", flexDirection: "column", gap: "3", width: "100%" })}>
      {section.heading && (
        <h2
          className={css({
            textAlign: "center",
            fontSize: "xs",
            fontWeight: "700",
            letterSpacing: ".25em",
            color: "textDim",
            marginTop: "2",
          })}
        >
          {section.heading}
        </h2>
      )}
      {section.items.map((item) => (
        <a
          key={item.url}
          href={item.url}
          target="_blank"
          rel="noopener"
          className={cx(
            "glass",
            css({
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "999px",
              paddingY: "3.5",
              paddingX: "6",
              fontWeight: "700",
              textShadow: "0 1px 2px rgba(0,0,0,.2)",
              transition: "transform .2s ease, filter .2s ease",
              _hover: { transform: "scale(1.03)", filter: "brightness(1.12)" },
              _motionReduce: { transition: "none", _hover: { transform: "none" } },
            }),
          )}
        >
          {item.label}
        </a>
      ))}
    </section>
  );
}
```

- [ ] **Step 5: index.tsx をページ本体に置き換え**

`src/pages/index.tsx`:

```tsx
import { css } from "../styled-system/css";
import { Background } from "../components/background";
import { ProfileCard } from "../components/profile-card";
import { LinkSectionBlock } from "../components/link-section";
import { sections } from "../lib/links";

const DESCRIPTION = "じょうげんのリンク集。SNS・Webアプリ・同人誌の入り口をまとめています。";

export default async function HomePage() {
  return (
    <>
      <title>じょうげん | links</title>
      <meta name="description" content={DESCRIPTION} />
      <meta property="og:title" content="じょうげん | links" />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content="https://links.bmth.dev/" />
      <meta property="og:image" content="https://links.bmth.dev/avatar.png" />
      <meta name="twitter:card" content="summary" />
      <link rel="icon" href="/avatar.png" />
      <Background />
      <main
        className={css({
          maxWidth: "28rem",
          marginX: "auto",
          paddingX: "5",
          paddingY: "12",
          display: "flex",
          flexDirection: "column",
          gap: "6",
        })}
      >
        <ProfileCard />
        {sections.map((section, i) => (
          <LinkSectionBlock key={section.heading ?? i} section={section} />
        ))}
      </main>
    </>
  );
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
```

- [ ] **Step 6: ビルド検証が通ることを確認**

```bash
pnpm test && pnpm build && pnpm check-build
```

Expected: vitest PASS → ビルド成功 → `OK: all required content present`

- [ ] **Step 7: 見た目をモックと突き合わせる**

```bash
pnpm dev
```

ブラウザで http://localhost:3000 を開き、`docs/reference/final-liquid-mock.html`(ファイルを直接ブラウザで開く)と並べて比較。確認項目: ガラスのぼかし/ボーダー/ハイライト、ピル型ボタン、hover拡大、見出しの letter-spacing、ブロブが漂う、OSをライトモードにすると配色が切り替わる、幅375pxで崩れない。ずれていればモックに寄せて css 値を修正する。

- [ ] **Step 8: コミット**

```bash
git add -A
git commit -m "feat: Liquid Glass の1ページUIを実装"
```

---

### Task 5: デプロイ設定(Cloudflare Workers 静的アセット + GitHub Actions)

**Files:**

- Create: `src/waku.server.tsx`, `wrangler.jsonc`, `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**

- Consumes: `dist/public/`(waku build の静的出力)
- Produces: main への push で links.bmth.dev に自動デプロイされるパイプライン

- [ ] **Step 1: サーバーエントリを静的アダプタで作成**

`src/waku.server.tsx`:

```tsx
import { fsRouter } from "waku";
import adapter from "waku/adapters/cloudflare";

export default adapter(fsRouter(import.meta.glob("./**/*.{tsx,ts}", { base: "./pages" })), {
  static: true,
});
```

注意: 既存の Waku バージョンでこの API が無い場合は `npx ctx7@latest docs /websites/waku_gg "cloudflare static deployment"` で現行の書き方を確認して合わせる。

- [ ] **Step 2: wrangler.jsonc を作成**

```jsonc
{
  "name": "links",
  "compatibility_date": "2026-07-01",
  "assets": {
    "directory": "./dist/public",
    "html_handling": "drop-trailing-slash",
  },
  "routes": [{ "pattern": "links.bmth.dev", "custom_domain": true }],
}
```

- [ ] **Step 3: ビルドとデプロイのドライランを確認**

```bash
pnpm build && pnpm check-build
npx wrangler deploy --dry-run
```

Expected: dry-run が成功し、アップロード対象に `index.html` と `avatar.png` が含まれる。

- [ ] **Step 4: GitHub Actions ワークフローを作成**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm build
      - run: pnpm check-build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

- [ ] **Step 5: README を作成**

`README.md`:

```markdown
# links

[links.bmth.dev](https://links.bmth.dev/) — じょうげんのリンク集。

- Waku(静的RSC)+ Panda CSS。Apple Liquid Glass 風デザイン
- リンクの追加・変更は `src/lib/links.ts` を編集するだけ
- main に push すると GitHub Actions が Cloudflare Workers(静的アセット)へデプロイ

## 開発

pnpm install / pnpm dev / pnpm test / pnpm build && pnpm check-build

## 必要なシークレット(GitHub Actions)

- `CLOUDFLARE_API_TOKEN`(Workers Scripts:Edit 権限)
- `CLOUDFLARE_ACCOUNT_ID`
```

- [ ] **Step 6: コミットして GitHub リポジトリを作成・push**

```bash
git add -A
git commit -m "feat: Cloudflare デプロイ設定と CI を追加"
gh repo create bmthd/links --public --source . --push
```

Expected: https://github.com/bmthd/links が作成され main が push される。

- [ ] **Step 7: 手動セットアップをユーザーに依頼(ブロッキング)**

以下はユーザーのCloudflare/GitHub操作が必要。依頼して完了を待つ:

1. Cloudflare ダッシュボードで API トークン作成(テンプレート「Workers を編集する」)とアカウントIDの確認
2. GitHub リポジトリ bmthd/links の Settings → Secrets and variables → Actions に `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` を登録
3. 登録後、Actions の Deploy ワークフローを再実行(または空コミットpush)
4. 初回デプロイ後、custom_domain 設定により links.bmth.dev が自動で有効化されるので、`curl -sI https://links.bmth.dev/` で 200 を確認(DNSはCloudflare管理なので追加作業は原則不要)

---

### Task 6: 最終検証とクローズ

**Files:** なし(検証のみ)

- [ ] **Step 1: 本番URLの検証**

```bash
curl -s https://links.bmth.dev/ -o /tmp/live.html
node -e "
const html = require('fs').readFileSync('/tmp/live.html','utf8');
for (const s of ['じょうげん','x.com/j_ktwr','zenn.dev/bmth','booth.pm','circle_id=107344']) {
  if (!html.includes(s)) { console.error('MISSING', s); process.exit(1); }
}
console.log('OK');
"
curl -sI https://links.bmth.dev/avatar.png | head -1
```

Expected: `OK` と `HTTP/2 200`

- [ ] **Step 2: OGP の確認**

X の Card Validator 相当は廃止されているため、実ポストのプレビューか https://www.opengraph.xyz/ 等でユーザーに確認してもらう。`og:title` / `og:image` が表示されること。

- [ ] **Step 3: 仕様書の運用メモを実行**

ユーザーに確認のうえ、旧リポジトリをアーカイブ:

```bash
gh repo archive bmthd/portfolio --yes
```

(ユーザーがまだ残したい場合はスキップし、その旨を報告する)

- [ ] **Step 4: 完了報告**

本番URL・リポジトリURL・今後のリンク追加手順(`src/lib/links.ts` に1要素追加してpush)を報告して終了。
