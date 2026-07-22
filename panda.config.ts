import { defineConfig, defineGlobalStyles } from "@pandacss/dev";

const globalCss = defineGlobalStyles({
  // iOS Safari ignores `background-attachment: fixed`, so the page gradient
  // must NOT live on <body>: there it sticks to the document instead of the
  // viewport, and rubber-band overscroll past the page edges exposes the
  // unstyled (white) canvas — which reads as "the page scrolls beyond the
  // screen". Instead the gradient is painted by the existing fixed background
  // layer (src/components/background.tsx), which covers exactly the viewport
  // everywhere, and <html> gets a solid color matching the gradient's end so
  // the canvas — the only thing visible in overscroll bands — stays in-theme
  // no matter how far the page is pulled.
  //
  // The colors are written literally (not as a semantic token + `_light`)
  // because the light/dark condition is a descendant selector on
  // `[data-theme]`, which can never match <html> — the element the attribute
  // itself lives on.
  html: {
    backgroundColor: "#0A1830",
    '&[data-theme="light"]': { backgroundColor: "#F4FAFF" },
  },
  body: {
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
    minHeight: "100dvh",
    color: "text",
  },
  // FOUT fade-in (see FONT_FADE_INIT_SCRIPT in src/pages/_root.tsx): elements
  // marked `data-fade` (text blocks: ProfileCard's h1/p, each link section,
  // the footer and the theme toggle button) are hidden
  // while `<html data-fonts="loading">` and fade to visible once that
  // attribute is removed. The background (no `data-fade` marker) is
  // unaffected and stays visible throughout, so the page is never a blank
  // white/blank screen. The fade always runs at this duration, even on a
  // browser font cache hit — skipping it for fast resolutions used to cause
  // a one-frame flash of `data-fade` elements popping in instantly.
  "[data-fade]": {
    transition: "opacity .3s ease-out",
  },
  '[data-fonts="loading"] [data-fade]': {
    opacity: 0,
    pointerEvents: "none",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "[data-fade]": {
      transition: "none",
    },
  },
  // Drop the UA cross-fade and stack the new snapshot on top so the theme
  // toggle's clip-path reveal (theme-toggle.tsx) does all the visible work.
  "::view-transition-old(root), ::view-transition-new(root)": {
    animation: "none",
    mixBlendMode: "normal",
  },
  "::view-transition-old(root)": { zIndex: 0 },
  "::view-transition-new(root)": { zIndex: 1 },
  ".glass": {
    background: "rgba(255,255,255,.12)",
    // Written as raw kebab-case properties (prefix first, standard last) so
    // Panda emits them verbatim instead of routing through its built-in
    // `backdropFilter` utility, which always emits the pair in the opposite
    // order (standard, then `-webkit-`). lightningcss's minifier only
    // recognizes "vendor-prefixed fallback, then standard override" as an
    // intentional compat pair to preserve when a build target still needs
    // the prefix; the reverse order gets collapsed to whichever declaration
    // is last. See waku.config.ts for the matching `build.cssTarget`.
    "-webkit-backdrop-filter": "blur(16px) saturate(180%)",
    "backdrop-filter": "blur(16px) saturate(180%)",
    border: "1px solid rgba(255,255,255,.3)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 1px rgba(255,255,255,.08), 0 8px 24px rgba(0,0,0,.25)",
    "[data-theme=light] &": {
      background: "rgba(255,255,255,.45)",
      border: "1px solid rgba(255,255,255,.65)",
    },
    "@supports not (backdrop-filter: blur(1px))": {
      background: "rgba(30,62,110,.92)",
      "[data-theme=light] &": {
        background: "rgba(255,255,255,.92)",
      },
    },
  },
});

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{ts,tsx}"],
  exclude: ["./src/styled-system/**"],
  outdir: "src/styled-system",
  globalCss,
  conditions: {
    extend: {
      // Theme is applied as `data-theme` on <html> by the inline script in
      // src/pages/_root.tsx (and toggled by src/components/theme-toggle.tsx),
      // so color-mode conditions target that attribute instead of the OS
      // preference media query.
      light: "[data-theme=light] &",
      dark: "[data-theme=dark] &",
    },
  },
  theme: {
    extend: {
      keyframes: {
        float1: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(36px, -40px)" },
        },
        float2: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-40px, 28px)" },
        },
        float3: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(28px, 38px)" },
        },
      },
      semanticTokens: {
        colors: {
          text: {
            value: { base: "rgba(255,255,255,.92)", _light: "#0F2A4A" },
          },
          textDim: {
            value: { base: "#BFE8FF", _light: "#33557F" },
          },
          accent: { value: "#38BDF8" },
          accentSub: { value: "#5B7BFF" },
        },
        gradients: {
          page: {
            value: {
              base: "linear-gradient(160deg, #1D4E89 0%, #173A6B 45%, #0A1830 100%)",
              _light: "linear-gradient(160deg, #BFE0FF 0%, #DCEEFF 45%, #F4FAFF 100%)",
            },
          },
        },
      },
    },
  },
});
