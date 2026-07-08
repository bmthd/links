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
