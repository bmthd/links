import { defineWranglerConfig } from "wrangler/experimental-config";

// Bundler settings for `cf build`/`cf deploy`; Worker settings live in cloudflare.config.ts.
export default defineWranglerConfig({
  assetsDirectory: "./dist/public",
});
