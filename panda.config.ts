import { defineConfig, defineGlobalStyles } from "@pandacss/dev";

const globalCss = defineGlobalStyles({
  body: {
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
    minHeight: "100dvh",
    color: "text",
    backgroundGradient: "page",
    backgroundAttachment: "fixed",
  },
  // FOUT fade-in (see FONT_FADE_INIT_SCRIPT in src/pages/_root.tsx): elements
  // marked `data-fade` (main / footer / the theme toggle button) are hidden
  // while `<html data-fonts="loading">` and fade to visible once that
  // attribute is removed. The background (no `data-fade` marker) is
  // unaffected and stays visible throughout, so the page is never a blank
  // white/blank screen. `--font-fade-duration` defaults to a real fade but
  // is forced to `0s` by the script when the font resolves near-instantly
  // (e.g. warm HTTP cache without the localStorage skip flag), so a fast
  // load never forces the full fade duration.
  "[data-fade]": {
    transition: "opacity var(--font-fade-duration, .4s) ease",
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
