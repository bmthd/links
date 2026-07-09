import type { ReactNode } from "react";
import { ErrorBoundary } from "waku/router/client";

// Waku's built-in default root renders `<html>` without a `lang` attribute
// (see `DefaultRoot` in `waku/router/create-pages.js`). This file overrides
// it via the `_root` fs-router convention so the built page declares the
// correct document language.
//
// The inline script must run before first paint (FOUC prevention): it stamps
// `data-theme` on <html> from localStorage, falling back to the OS color
// scheme. `suppressHydrationWarning` is required because the server-rendered
// <html> has no data-theme attribute.
const THEME_INIT_SCRIPT =
  "document.documentElement.dataset.theme=localStorage.getItem('theme')??(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')";

// Prevents FOUT (M PLUS Rounded 1c is self-hosted via @fontsource and loads
// after first paint): text content — anything marked `data-fade` (see
// index.tsx / theme-toggle.tsx) — is hidden until the 400/700 weights used on
// the page have loaded, then fades in via CSS (`[data-fonts="loading"]
// [data-fade]` in panda.config.ts's globalCss). The background stays visible
// throughout since it has no `data-fade` marker.
//
// This only hides anything while JS is running: the `data-fonts="loading"`
// attribute is set here, synchronously, before first paint (same FOUC-
// prevention pattern as the theme script above), and CSS only reacts to that
// attribute. With JS disabled the attribute is never set, so the CSS default
// (visible) applies and content is never hidden — deliberately not doing
// "CSS hides by default, JS reveals", which would leave content invisible
// forever without JS.
//
// The gate runs on EVERY visit — there is deliberately no "already visited"
// persistence (an earlier revision skipped the gate via a localStorage flag,
// which leaked FOUT whenever the flag survived but the browser's font cache
// didn't, e.g. after cache eviction or a hard reload). The fade also always
// runs at its full duration, even on a browser font cache hit: an earlier
// revision skipped the fade (`--font-fade-duration: 0s`) when fonts resolved
// within ~100ms, but that instant reveal itself showed up as a one-frame
// flash of the `data-fade` elements (notably the theme toggle button)
// popping in. A short, unconditional fade reads as smooth in both the cold
// and cached cases.
//
// `document.fonts.check()` is not used to detect readiness: the @fontsource
// `@font-face` rules (declared in the stylesheet imported by _layout.tsx)
// may not be registered in `document.fonts` yet when this script runs, so
// `check()` could wrongly report `false` even for a cached font.
// `document.fonts.load()` is used instead to kick off loading (or resolve
// immediately if already available), chained into `document.fonts.ready` as
// the actual completion signal, which correctly waits for the real glyph
// subsets the page's Japanese text needs regardless of registration timing.
//
// A slow or failed load is capped at 3s by `Promise.race` so content is
// never hidden indefinitely.
const FONT_FADE_INIT_SCRIPT = `(function(){
  if(!('fonts' in document))return;
  var html=document.documentElement;
  html.dataset.fonts='loading';
  function reveal(){
    delete html.dataset.fonts;
  }
  var loaded=Promise.all([
    document.fonts.load('400 1em "M PLUS Rounded 1c"'),
    document.fonts.load('700 1em "M PLUS Rounded 1c"')
  ]).catch(function(){}).then(function(){return document.fonts.ready});
  var timeout=new Promise(function(resolve){setTimeout(resolve,3000)});
  Promise.race([loaded,timeout]).then(reveal);
})();`;

// Cloudflare Web Analytics beacon (cookieless, free). The site token is
// issued per-domain in the Cloudflare dashboard (Web Analytics -> Add a
// site -> Manual setup, since automatic JS injection doesn't apply to sites
// served from Workers). It's injected at build time via the `VITE_`-
// prefixed env var below, which Vite inlines into the static-rendered HTML
// (see `getConfig`'s `render: "static"`); see README for the Actions
// variable setup.
//
// The tag is only emitted when the token is present, so PR preview builds
// and forks -- which never receive the token -- render no beacon at all
// rather than shipping a broken/empty one, keeping their traffic out of the
// production analytics dashboard.
const CF_BEACON_TOKEN = import.meta.env.VITE_CF_BEACON_TOKEN;

export default function Root({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <html lang="ja" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
          <script dangerouslySetInnerHTML={{ __html: FONT_FADE_INIT_SCRIPT }} />
          {CF_BEACON_TOKEN && (
            <script
              defer
              src="https://static.cloudflareinsights.com/beacon.min.js"
              data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
            />
          )}
        </head>
        <body>{children}</body>
      </html>
    </ErrorBoundary>
  );
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
