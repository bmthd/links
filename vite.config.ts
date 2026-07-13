import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    ".github/workflows/*.{yml,yaml}": "pinact run",
  },
});
