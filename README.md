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

## Cloudflare Web Analytics(任意)

cookie不要・無料のアクセス解析。有効化する場合のみ以下を設定する(未設定ならビーコンタグ自体が出力されない):

1. Cloudflareダッシュボード → Web Analytics → Add a site → `links.bmth.dev` を追加
   - Workers配信サイトは自動設置(プロキシ経由の自動注入)が効かないため **Manual setup** を選ぶ
2. 発行されたサイトトークン(`data-cf-beacon` の `token` 値)を控える
3. リポジトリの Settings → Secrets and variables → Actions → **Variables** タブに `CF_BEACON_TOKEN` としてそのトークンを登録する
   - ビルド済みHTMLにそのまま埋め込まれる値のため secrets ではなく variables でよい
4. main への push で自動デプロイされるビルドにのみ埋め込まれる。PRプレビュービルドやフォークではトークンが渡らず計測が混ざらない
