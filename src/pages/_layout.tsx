import type { ReactNode } from "react";
// Subset-specific imports instead of the default `400.css` / `700.css`:
// the defaults declare ~126 unicode-range-split @font-face rules per weight
// (~110KB of CSS each) covering every script fontsource ships. This page
// only renders Japanese and Latin text, so importing just those subsets
// drops the built CSS from ~300KB to ~22KB. Note the japanese subset is a
// single un-split file (no unicode-range), so the full japanese woff2 is
// downloaded instead of per-page fragments — see the preload links in
// _root.tsx which start those downloads at HTML parse time.
//
// Order matters: latin comes after japanese so the latin face (declared
// later, tried first — neither face has a unicode-range) serves Latin text,
// falling through to the japanese face for kana/kanji glyphs it lacks.
import "@fontsource/m-plus-rounded-1c/japanese-400.css";
import "@fontsource/m-plus-rounded-1c/japanese-700.css";
import "@fontsource/m-plus-rounded-1c/latin-400.css";
import "@fontsource/m-plus-rounded-1c/latin-700.css";
import "../styles.css";

export default async function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
