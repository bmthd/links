import type { ReactNode } from "react";
import { ErrorBoundary } from "waku/router/client";
import { fontPreloads } from "../generated/fonts";

// Runs before first paint to set `data-theme` from localStorage/OS, avoiding
// a theme flash. suppressHydrationWarning below: server HTML has no data-theme.
const THEME_INIT_SCRIPT =
  "document.documentElement.dataset.theme=localStorage.getItem('theme')??(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')";

// Hides `data-fade` text until the self-hosted fonts load, then fades it in
// via CSS (globalCss in panda.config.ts), preventing FOUT. Runs before first
// paint; with JS disabled the attribute is never set, so content stays visible.
// Uses fonts.load()+ready rather than fonts.check(), which can falsely report a
// cached font as unavailable before its @font-face is registered. Capped at 3s.
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

// Emitted only when the token is set (see README), so PR preview builds and
// forks — which never receive it — stay out of the analytics dashboard.
const CF_BEACON_TOKEN = import.meta.env.VITE_CF_BEACON_TOKEN;

export default function Root({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <html lang="ja" suppressHydrationWarning>
        <head>
          {/* Preload the always-needed subset fonts (LCP gates on their load).
              crossOrigin is required even same-origin, else the CORS-mode CSS
              font fetch won't reuse the preload. */}
          {fontPreloads.map((href) => (
            <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="" />
          ))}
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
