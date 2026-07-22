// Post-build optimizations applied to dist/public/index.html after
// `waku build`. Both target the same thing: nothing on the first-paint /
// LCP critical path except the HTML document itself.
//
// 1. Inline the stylesheet. It is small (~21 KB raw / ~6 KB gzip: Panda
//    output plus the two @font-face rules from generate-fonts.ts), but as an
//    external file it is render-blocking and costs a full round trip — on
//    Lighthouse's simulated slow-4G that round trip alone kept FCP at ~1.7s.
//    The hashed CSS file is left in dist/public/assets: the RSC payload
//    still references it by href, so React float re-inserts the <link>
//    during hydration. That late fetch applies rules identical to the
//    inlined ones, so it is harmless.
//
// 2. Defer the hydration JS until after the window load event. Everything on
//    this page works without React at runtime — the content is static HTML,
//    and the theme/font-fade scripts are framework-free inline scripts — so
//    hydration is pure enhancement and nothing visible waits on it. Left
//    eager, the ~74 KB (gzip) of module-preloaded JS competes with the
//    document, fonts and paint in Lighthouse's throttled model and was the
//    entire remaining gap to a 100 performance score (LCP 2.0s → 1.2s,
//    FCP 1.5s → 0.8s measured locally). The modulepreload hints are dropped
//    and the router bootstrap's dynamic import is wrapped in a load
//    listener; hydration still runs, just off the critical path.
//    CAVEAT: interactive client components (currently only ThemeToggle) stay
//    inert until hydration. That window is invisible today because the
//    toggle is opacity-gated behind the font load anyway; revisit this
//    trade-off before adding client components that must respond instantly.
//
// Runs directly with `node scripts/optimize-html.ts` (type stripping), so
// only erasable TypeScript syntax is used.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const htmlPath = "dist/public/index.html";
const html = readFileSync(htmlPath, "utf8");

const stylesheetRe = /<link rel="stylesheet" href="(\/assets\/[^"]+\.css)"[^>]*>/;
const stylesheet = html.match(stylesheetRe);
if (!stylesheet) {
  console.error(`NOT FOUND: render-blocking stylesheet <link> in ${htmlPath}`);
  process.exit(1);
}
const href = stylesheet[1] as string;
const css = readFileSync(join("dist/public", href), "utf8");

const bootstrapRe = /import\("(\/assets\/index-[^"]+\.js)"\)/;
if (!bootstrapRe.test(html)) {
  console.error(`NOT FOUND: hydration bootstrap import() in ${htmlPath}`);
  process.exit(1);
}

const optimized = html
  .replace(stylesheetRe, `<style>${css}</style>`)
  // The matching `<link rel="preload" as="stylesheet">` is pointless once the
  // rules are inline; the hydration-time re-insert is deliberately late.
  .replace(new RegExp(`<link rel="preload" href="${href}" as="stylesheet"[^>]*>`), "")
  .replace(/<link rel="modulepreload"[^>]*>/g, "")
  .replace(bootstrapRe, 'addEventListener("load",()=>setTimeout(()=>import("$1"),0),{once:true})');

writeFileSync(htmlPath, optimized);
console.log(`inlined ${href} (${css.length} bytes) and deferred hydration in ${htmlPath}`);
