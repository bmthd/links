# links

[links.bmth.dev](https://links.bmth.dev/) — じょうげんのリンク集。

- Waku(静的RSC)+ Panda CSS。Apple Liquid Glass 風デザイン
- リンクの追加・変更は `src/lib/links.ts` を編集するだけ
- 日本語(`/`)と英語(`/en`)の2ロケール。詳細は下記「多言語対応」
- 同じプロフィールとリンクを JSON でも配信する。詳細は下記「プロフィール API」
- main に push すると GitHub Actions が [`cf`](https://github.com/cloudflare/cf) CLI で Cloudflare Workers(静的アセット)へデプロイ。Worker設定は `cloudflare.config.ts`、アセットの場所は `wrangler.config.ts`(cf が使う wrangler バンドラーの設定)

## 開発

pnpm install / pnpm dev / pnpm test / pnpm build && pnpm check-build

手元からデプロイする場合: `pnpm build && pnpm exec cf-wrangler build && pnpm exec cf deploy --prebuilt`(`cf build` は Waku を検出して素の `waku build` だけを走らせるため使わない)

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

## プロフィール API

ほかのサイトがプロフィールとリンクを自前で持たずに済むよう、ビルド時に `scripts/generate-api.ts` が [`/profile.json`](https://links.bmth.dev/profile.json) を書き出す。中身は `src/lib/links.ts` から作るので、リンクを直せば API も変わる。

- 名前・bio・ラベルは常に `{ "ja": …, "en": … }` の形(固有名詞も全ロケール分を埋める)
- `avatar` は `/avatar-192.webp` と `/avatar-96.png` の絶対 URL
- `sections` はページと同じ順。`id`(`sns` / `works` / `doujinshi`)で名前で取り出せる(例: `sections.find((s) => s.id === "works")`)。`heading` は見出しなしのとき `null`、`me` は本人のアカウントか
- CORS は全オリジンに開け、1 時間キャッシュする(`public/_headers`)
- フィールドを消したり意味を変えたりするときは `version` を上げる(`src/lib/profile-api.ts`)

## 依存の自動アップデート(Renovate)

`renovate.json` で [Renovate](https://github.com/apps/renovate) が毎週月曜朝(JST)に更新PRを作る。npm(`package.json`、`.github/visual-diff/package.json`、`pnpm-workspace.yaml` の overrides)、GitHub Actions(ワークフローの `uses:` のタグ)、`mise.toml`(Node / pnpm)が対象。

- 公開から1日経っていないバージョンは提案しない(pnpm の `minimumReleaseAge` に合わせている)
- 安定版の minor / patch は CI が通れば Renovate が自動マージ → main への push で自動デプロイ
- GitHub Actions は [gh-actions-lock](https://github.com/github/gh-actions-lock) で `.github/workflows/actions.lock` にSHAを固定している。Renovate はこのロックファイルを更新できず、PRの CI(`gh actions-lock --verify`)が落ちるので、PRブランチで `gh actions-lock` を実行してロックファイルをコミットしてからマージする
- major、0.x、プレリリース(waku beta など)、Node / pnpm は自動マージせず手動レビュー
- vite-plus・vite-plus-core・vitest は overrides で揃えているため1つのPRにまとめる
- 有効化にはリポジトリへの Renovate GitHub App のインストールが必要

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
