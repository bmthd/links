# プロフィール API Implementation Plan

**Goal:** `/profile.json` の各セクションに `id` を付け、works を名前で取り出せるようにして PR を出す。

**Spec:** docs/superpowers/specs/2026-11-13-profile-api-design.md

## Review Focus

- 見出しのない SNS セクションも `id: "sns"` で取れること
- id がセクション間で重複しないこと(型 + テスト)

### Task 1: セクション id

**Files:** Modify `src/lib/links.ts`, `src/lib/profile-api.ts`, `src/lib/links.test.ts`, `src/lib/profile-api.test.ts`, `README.md`

- Produces: `type SectionId = "sns" | "works" | "doujinshi"`; `LinkSection.id: SectionId`; API の各 section に `id`
- [ ] テスト: `api.sections.map((s) => s.id)` が `["sns", "works", "doujinshi"]`、`links.ts` の id が一意
- [ ] 失敗を確認 → 実装 → `pnpm test` / `pnpm typecheck` / `pnpm check` 通過
- [ ] `pnpm build && pnpm check-build` 通過、生成 JSON を目視
- [ ] README に `id` を追記、コミット、PR
