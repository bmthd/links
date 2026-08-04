# links

[links.bmth.dev](https://links.bmth.dev/) — じょうげんのリンク集。

- Waku(静的RSC)+ Panda CSS。Apple Liquid Glass 風デザイン
- リンクの追加・変更は `src/lib/links.ts` を編集するだけ
- 日本語(`/`)と英語(`/en`)の2ロケール。詳細は下記「多言語対応」
- main に push すると GitHub Actions が Cloudflare Workers(静的アセット)へデプロイ

## 開発

pnpm install / pnpm dev / pnpm test / pnpm build && pnpm check-build

## 多言語対応

- 既定ロケール(日本語)は `/`、それ以外は `/<locale>`(英語なら `/en`)に静的HTMLとして出力される。ブラウザ言語による自動リダイレクトはせず、URLが表示言語を決める
- 切り替えは右上のボタン。中身はただの `<a>` なので JS 無効でもハイドレーション前でも動く
- 文言の置き場所:
  - UI文言(description / aria-label など)は `src/lib/i18n.ts` の `ui`
  - プロフィールとリンクラベルは `src/lib/links.ts`。素の文字列は「全ロケール共通」(X / GitHub / BOOTH のような固有名詞)、`{ ja: "…", en: "…" }` は翻訳対象
- ロケールを追加する手順:
  1. `src/lib/i18n.ts` の `locales` に足す
  2. 型エラーになった箇所(`localeMeta`、`ui`、`src/lib/links.ts` のラベル)を埋める
  3. `src/pages/en/index.tsx` と同じ形で `src/pages/<locale>/index.tsx` を作る

  OG画像の生成・hreflang・言語切替ボタン・`pnpm check-build` の検証項目はロケール定義から導出しているため、この3手順以外の変更は要らない

- `<html lang>` だけは例外。Wakuはルート要素(`src/pages/_root.tsx`)を全ルートで1回しか描画しないためロケールごとに変えられず、ビルド後に `scripts/optimize-html.ts` が各HTMLを書き換えている。`waku dev` では非既定ロケールのページも `lang="ja"` のままになる

## 必要なシークレット(GitHub Actions)

- `CLOUDFLARE_API_TOKEN`(Workers Scripts:Edit 権限)
- `CLOUDFLARE_ACCOUNT_ID`

## Cloudflare Web Analytics(任意)

cookie不要・無料のアクセス解析。有効化する場合のみ以下を設定する(未設定ならビーコンタグ自体が出力されない):

1. Cloudflareダッシュボード → Web Analytics → Add a site → `links.bmth.dev` を追加
   - Workers配信サイトは自動設置(プロキシ経由の自動注入)が効かないため **Manual setup** を選ぶ
2. 発行されたサイトトークン(`data-cf-beacon` の `token` 値)を控える
3. リポジトリの Settings → Secrets and variables → Actions → **Variables** タブに `CF_BEACON_TOKEN` としてそのトークンを登録する
   - ビルド済みHTMLにそのまま埋め込まれる値のため secrets ではなく variables でよい
4. main への push で自動デプロイされるビルドにのみ埋め込まれる。PRプレビュービルドやフォークではトークンが渡らず計測が混ざらない
