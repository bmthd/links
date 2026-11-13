# プロフィール API 設計

## 意図

ほかのサービス(まずは works の一覧を出したいサイト)が、このリンク集と同じプロフィールとリンクを自前で持たずに読めるようにする。画面に出しているものをそのまま返す。

## ゴール / 非ゴール

- ゴール: 静的な JSON 1 本(`/api/profile.json`)で SNS・WORKS・DOUJINSHI を全部返す。利用側が works だけを名前で取り出せる
- 非ゴール: セクションごとの個別エンドポイント、動的 API、認証
- アンチゴール: 画面と API の中身がずれること(どちらも `src/lib/links.ts` から作る)

## 方針

- ビルド時に `scripts/generate-api.ts` が `src/lib/profile-api.ts` の `buildProfileApi()` を JSON に書き出す
- `LinkSection` に `id`(`"sns" | "works" | "doujinshi"`)を足し、API の各セクションに含める。`sections` は画面と同じ順の配列のまま
- 利用例: `api.sections.find((s) => s.id === "works")`
- ラベル等は常に `{ ja, en }`。CORS は全オリジン許可、1 時間キャッシュ
- フィールド追加では `version` を上げない(1 のまま)

## 検討した案

- 配列 + `id`(採用): 画面と同じ順を明示的に保てる
- `sections` を `{ sns, works, doujinshi }` のオブジェクトにする: 取り出しは短いが、順序が JSON のキー順という暗黙の意味になる
- セクションごとに別ファイル: ユーザーが 1 本を希望したので不採用

## 私の判断で決めたこと

- id の値 `sns` / `works` / `doujinshi`
