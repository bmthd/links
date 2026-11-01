import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    // 絶対パスを渡すとロックファイルのキーと一致せず失敗するので、引数なしで全ワークフローを検査する
    ".github/workflows/*.{yml,yaml}": () => "gh actions-lock --verify-local",
  },
});
