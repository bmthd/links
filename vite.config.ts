import { defineConfig } from 'vite-plus';

export default defineConfig({
  // Vite+ のコミットフック設定。pre-commit で `vp staged` が実行される。
  staged: {
    // GitHub Actions のバージョンを pinact でコミットSHAへ自動ピン留めする。
    // pinact 本体は mise(mise.toml)で導入する。
    '.github/workflows/*.{yml,yaml}': 'pinact run',
  },
});
