import { defineConfig } from "waku/config";

export default defineConfig({
  vite: {
    build: {
      // Waku beta's rolldown-vite (Vite 8) defaults to the Lightning CSS
      // minifier. Lightning CSS's minifier merges a standard property with
      // its vendor-prefixed variant (e.g. `backdrop-filter` /
      // `-webkit-backdrop-filter`) and keeps only ONE declaration -- but
      // which one depends on browser targets: if the target set still needs
      // the prefix, both are kept (in "prefix-first, standard-last" order);
      // if not, only the standard one is kept. Without any target info it
      // falls back to "keep whichever is last in source", which is why this
      // used to silently drop the standard property (Panda emitted
      // `backdrop-filter` before `-webkit-backdrop-filter`) and break the
      // Liquid Glass blur in Chrome/Firefox. That was previously "fixed" by
      // switching to `cssMinify: 'esbuild'`, which doesn't understand CSS
      // vendor-prefix pairs at all and never merges them -- avoiding the
      // Chrome/Firefox breakage, but also leaving Lightning CSS's syntax
      // lowering/minification unused for CSS.
      //
      // The correct fix has two parts:
      //  1. panda.config.ts now emits `-webkit-backdrop-filter` BEFORE
      //     `backdrop-filter` (see the comment there) instead of relying on
      //     Panda's built-in `backdropFilter` utility, which always emits
      //     the pair in the opposite (unmergeable) order.
      //  2. `build.cssTarget` is set explicitly below with a Safari version
      //     older than 18 (the version that added *unprefixed*
      //     `backdrop-filter` support), so Lightning CSS knows the
      //     `-webkit-` fallback is still load-bearing and keeps both
      //     declarations.
      //
      // Note: `css.lightningcss.targets` (the option normally documented
      // for Vite's Lightning CSS integration) has NO effect here. It's only
      // read when `css.transformer` is itself set to `'lightningcss'`; for
      // the (default) postcss-transform + lightningcss-*minify* pipeline
      // used by this project (see postcss.config.cjs), Vite's own
      // `minifyCSS()` unconditionally overwrites the targets it passes to
      // Lightning CSS with `convertTargets(config.build.cssTarget)`
      // (vite/dist/node/chunks/node.js). Confirmed by reading that source
      // and reproducing the merge behavior directly against the
      // `lightningcss` package with both `css.lightningcss.targets` (no
      // effect) and `build.cssTarget` (works as expected).
      //
      // `cssTarget` intentionally does NOT reuse Vite's default
      // "baseline-widely-available" target (which happens to already
      // include safari16.4/ios16.4 today) because that default is bumped on
      // every Vite major release and would silently start dropping the
      // `-webkit-` fallback again once it moves past Safari 18.
      cssTarget: ["chrome111", "edge111", "firefox114", "safari15", "ios15"],
    },
  },
});
