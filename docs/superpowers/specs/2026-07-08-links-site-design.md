# links.bmth.dev 設計書

2026-07-08 確定。ブレインストーミング(テキスト + ビジュアルコンパニオン)でユーザーと合意済み。

## 目的

X のプロフィールに貼る名刺、および自分の成果物・アカウントを 1 箇所にまとめるハブページ。
litlink 風の 1 ページ静的サイト。日本語のみ。想定読者は X 経由の訪問者と自分自身。

旧サイト bmthd/portfolio(portfolio.bmth.dev)は置き換えではなく併存。旧リポは GitHub 上で Archive し、旧 URL は当面そのまま残す。

## コンテンツ(表示順)

1. **プロフィール**
   - アイコン: GitHub アバター(`https://github.com/bmthd.png` をビルド時に取得しリポジトリに同梱。実行時フェッチはしない)
   - 表示名: じょうげん
   - bio: フルスタック趣味人
2. **SNS リンク**(見出しなし、縦並びボタン)
   - X — `https://x.com/j_ktwr`
   - GitHub — `https://github.com/bmthd`
   - Zenn — `https://zenn.dev/bmth`
   - Blog — `https://blog.bmth.dev/`
3. **WORKS**(セクション見出しあり)
   - ポイントスプリント — `https://point-sprint.bmth.dev/`
   - お品書きまとめ — `https://oshinagaki.bmth.dev/`
4. **DOUJINSHI**(セクション見出しあり)
   - BOOTH(ブルーメソッド) — `https://bluemethod.booth.pm/`
   - メロンブックス — `https://www.melonbooks.co.jp/circle/index.php?circle_id=107344`

- 全リンクは `target="_blank" rel="noopener"`。
- フッター: ページ最下部に「Made by じょうげん」+ リポジトリ(github.com/bmthd/links)へのリンク(2026-07-09 ユーザー要望で追加)。
- リンク生存確認は 2026-07-07 に全 URL で実施済み。

## 技術スタック

| 項目           | 選定                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| フレームワーク | Waku(サーバーなし RSC、静的ビルド)                                                    |
| スタイリング   | Panda CSS(ゼロランタイム。RSC と互換)                                                 |
| フォント       | M PLUS Rounded 1c(400/700)。self-host して外部リクエストを避ける                      |
| データ管理     | `src/links.ts` に型付き配列で集約。リンク追加 = 配列に 1 要素追加                     |
| ホスティング   | Cloudflare Workers 静的アセット                                                       |
| デプロイ       | GitHub Actions: main への push で `wrangler deploy`                                   |
| リポジトリ     | bmthd/links(新規・public)                                                             |
| 公開 URL       | https://links.bmth.dev/(DNS は Cloudflare 管理。Workers のカスタムドメインとして設定) |

## ビジュアルデザイン(ビジュアルコンパニオンで確定)

参照モック: `docs/reference/final-liquid-mock.html`(確定時の完成形。実装時の CSS 参照元)

- **方向性**: Apple Liquid Glass(WWDC 2025)の CSS 再現スタイル。世間の再現例に寄せる
- **背景(ダーク基準)**: `linear-gradient(160deg, #1D4E89 0%, #173A6B 45%, #0A1830 100%)`
  - ガラス越しに透けるぼかした光のブロブを配置(#38BDF8 / #5B7BFF 系)
  - ブロブは CSS keyframes のみで 9〜11 秒周期のゆるい漂うアニメーション。`prefers-reduced-motion: reduce` で停止
- **アクセントカラー**: `#38BDF8`(サブの光: `#5B7BFF`)
- **ガラス表現(強度: 標準/Apple 寄り)**:
  - `background: rgba(255,255,255,.12)`
  - `backdrop-filter: blur(16px) saturate(180%)`
  - `border: 1px solid rgba(255,255,255,.3)`
  - 内側ハイライト: `inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 1px rgba(255,255,255,.08)`
  - 外側シャドウ: `0 8px 24px rgba(0,0,0,.25)`
- **ボタン**: ピル型(`border-radius: 999px`)、テキスト中央揃え・アイコンなし、白文字 + 薄いテキストシャドウ。ホバーで scale 1.03 程度 + ガラスがわずかに明るくなる
- **セクション見出し**: 英字小ラベル(`WORKS` / `DOUJINSHI`)、中央揃え、letter-spacing 約 .25em、淡いブルー(ダーク時 #BFE8FF 相当)。区切り線・カード囲みなし
- **カラーモード**: `[data-theme]` ベース + 右上のトグルボタンで切替(2026-07-09 ユーザー要望で `prefers-color-scheme` 追従から変更)。初期値は localStorage → OS設定の順、FOUC防止の同期スクリプトで適用。ダークが基準。ライト時: 背景 `linear-gradient(160deg,#BFE0FF,#DCEEFF,#F4FAFF)`、ボタン `rgba(255,255,255,.45)` + 濃紺文字(#0F2A4A)
- **ブロブ実装値**: blur 16px、移動量 ±28〜40px(blur 90px では動きが知覚できなかったため 2026-07-09 にモック準拠へ調整)

## メタ情報

- `<title>`: じょうげん | links
- description: 「じょうげんのリンク集。SNS・Webアプリ・同人誌の入り口をまとめています。」
- OGP: summary カード(`twitter:card: summary`)。画像はアバター流用
- favicon: アバターから生成

## エラー処理・テスト

- 完全静的 1 ページのため実行時エラー処理は対象外
- ビルド成功 + リンク URL の型チェック(`links.ts` の型)で担保
- 目視確認: ダーク/ライト両モード、モバイル幅(375px)〜デスクトップ、`backdrop-filter` 非対応時のフォールバック(半透明背景のみでも可読であること)

## やらないこと(YAGNI)

- アナリティクス
- 英語版
- Zenn 記事一覧などの動的取得
- 同人誌既刊の個別掲載(ショップリンク 2 つのみ)
- 旧 portfolio.bmth.dev のリダイレクト設定(旧サイトは当面そのまま)

## 運用メモ

- portfolio リポは実装完了後に GitHub で Archive する
- DNS: Cloudflare で links.bmth.dev を Workers のカスタムドメインに割当(自動で CNAME 相当が設定される)
