import { defineConfig } from 'waku/config';

export default defineConfig({
  vite: {
    build: {
      // Waku beta's rolldown-vite defaults to the lightningcss CSS
      // minifier (standard Vite defaults to esbuild), which treats a standard
      // property and its vendor-prefixed variant (e.g. `backdrop-filter` /
      // `-webkit-backdrop-filter`) as the same logical property and keeps
      // only the last declaration, silently dropping the standard one that
      // Panda CSS emits before the `-webkit-` fallback. This broke Liquid
      // Glass blur in Chrome/Firefox, which don't support the prefixed-only
      // form. esbuild's CSS minifier only strips whitespace/comments and
      // does not perform this dedup, so both declarations survive minification.
      cssMinify: 'esbuild',
    },
  },
});
