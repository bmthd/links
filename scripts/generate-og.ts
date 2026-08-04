// Generates one OG image (1200x630) per locale at build time with TakumiJS —
// public/og.png for the default locale, public/og-<locale>.png for the others
// (see ogImagePath in src/lib/i18n.ts, which the pages use for og:image).
// Design mirrors the site's Liquid Glass look: dark blue gradient, light
// blobs, and a glass panel with the avatar, name, bio and domain.
//
// The name and bio come from src/lib/links.ts so the card can never drift from
// the page. That import uses an explicit .ts extension because this file runs
// under Node's type stripping, which does no extension resolution.
//
// TakumiJS (`takumi-js`, a Rust-backed renderer) replaced satori + resvg here
// because it renders the same node tree to PNG in a single native pass — no
// intermediate SVG rasterization step — and is markedly faster (see issue #25).
//
// Fonts come from @fontsource/m-plus-rounded-1c already in node_modules
// (TakumiJS reads woff2 directly), so nothing is committed to the repo and no
// network access is needed during build. The avatar is embedded as raw PNG
// bytes straight from public/avatar.png.
//
// Runs directly with `node scripts/generate-og.ts` (type stripping), so only
// erasable TypeScript syntax is used (no JSX): the OG card is built as a plain
// Takumi node tree instead.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type ContainerNode, type Node, render } from "takumi-js";
import { type Locale, locales, ogImagePath, translator } from "../src/lib/i18n.ts";
import { profile } from "../src/lib/links.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const fontDir = join(root, "node_modules/@fontsource/m-plus-rounded-1c/files");
const font = (file: string): Buffer => readFileSync(join(fontDir, file));

const avatar = readFileSync(join(root, "public/avatar.png"));

// Soft light blob rendered as a radial gradient (matches the site's glow).
const blob = (size: number, color: string, position: Record<string, number>): ContainerNode => ({
  type: "container",
  style: {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    ...position,
  },
});

const card = (locale: Locale): Node => {
  const t = translator(locale);
  return {
    type: "container",
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'M PLUS Rounded 1c'",
      background: "linear-gradient(160deg, #1D4E89 0%, #173A6B 45%, #0A1830 100%)",
    },
    children: [
      blob(560, "rgba(56,189,248,.55)", { top: -160, left: -120 }),
      blob(480, "rgba(91,123,255,.5)", { bottom: -140, right: -80 }),
      blob(360, "rgba(56,189,248,.35)", { bottom: -80, left: 320 }),
      {
        type: "container",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "56px 72px",
          borderRadius: 36,
          background: "rgba(255,255,255,.12)",
          border: "1px solid rgba(255,255,255,.3)",
          boxShadow: "0 12px 40px rgba(0,0,0,.3)",
        },
        children: [
          {
            type: "image",
            src: avatar,
            width: 220,
            height: 220,
            style: {
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,.5)",
              boxShadow: "0 8px 24px rgba(0,0,0,.25)",
            },
          },
          {
            type: "container",
            style: { display: "flex", flexDirection: "column", gap: 18 },
            children: [
              {
                type: "text",
                text: t(profile.name),
                style: {
                  fontSize: 76,
                  fontWeight: 700,
                  color: "rgba(255,255,255,.95)",
                  textShadow: "0 2px 6px rgba(0,0,0,.4)",
                },
              },
              {
                type: "text",
                text: t(profile.bio),
                style: {
                  fontSize: 34,
                  color: "rgba(255,255,255,.88)",
                  textShadow: "0 1px 3px rgba(0,0,0,.4)",
                },
              },
              {
                type: "container",
                style: {
                  marginTop: 10,
                  alignSelf: "flex-start",
                  display: "flex",
                  padding: "12px 32px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.14)",
                  border: "1px solid rgba(255,255,255,.35)",
                },
                children: [
                  {
                    type: "text",
                    text: "links.bmth.dev",
                    style: {
                      fontSize: 28,
                      letterSpacing: "0.08em",
                      color: "#BFE8FF",
                      textShadow: "0 1px 2px rgba(0,0,0,.4)",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};

for (const locale of locales) {
  const png = await render(card(locale), {
    width: 1200,
    height: 630,
    // The japanese subset also covers basic latin, so it is the only subset
    // needed. Both weights are registered under the same family name; TakumiJS
    // picks the right face per weight.
    fonts: [
      {
        name: "M PLUS Rounded 1c",
        weight: 400,
        data: font("m-plus-rounded-1c-japanese-400-normal.woff2"),
      },
      {
        name: "M PLUS Rounded 1c",
        weight: 700,
        data: font("m-plus-rounded-1c-japanese-700-normal.woff2"),
      },
    ],
  });

  // ogImagePath is a public URL path ("/og.png"), so it is joined relative to
  // the directory that is served as the site root.
  const out = join(root, "public", ogImagePath(locale));
  writeFileSync(out, png);
  console.log(`generated public${ogImagePath(locale)} (${png.length} bytes)`);
}
