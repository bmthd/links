import { fsRouter } from "waku";
// Fully static site, so no Cloudflare-specific adapter is needed. Waku's
// cloudflare adapter would also write a wrangler.jsonc on every build when none
// exists, which clashes with cf's cloudflare.config.ts.
import adapter from "waku/adapters/edge";

export default adapter(fsRouter(import.meta.glob("./pages/**/*.{tsx,ts}")));
