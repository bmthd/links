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

export default function Root({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <html lang="ja" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        </head>
        <body>{children}</body>
      </html>
    </ErrorBoundary>
  );
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
