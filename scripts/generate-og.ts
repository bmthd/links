// Generates public/og.png (1200x630) at build time with satori + resvg.
// Design mirrors the site's Liquid Glass look: dark blue gradient, light
// blobs, and a glass panel with the avatar, name, bio and domain.
//
// Fonts come from @fontsource/m-plus-rounded-1c already in node_modules
// (satori accepts woff but not woff2), so nothing is committed to the repo
// and no network access is needed during build.
//
// Runs directly with `node scripts/generate-og.ts` (type stripping), so only
// erasable TypeScript syntax is used.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import type { ReactNode } from "react";
import satori from "satori";

// satori's non-JSX element form (element objects instead of JSX).
type OgElement = {
  readonly type: string;
  readonly props: {
    readonly style?: Record<string, string | number>;
    readonly children?: OgElement | readonly OgElement[] | string;
    readonly src?: string;
    readonly width?: number;
    readonly height?: number;
  };
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const fontDir = join(root, "node_modules/@fontsource/m-plus-rounded-1c/files");
const font = (file: string): Buffer => readFileSync(join(fontDir, file));

const avatar = `data:image/png;base64,${readFileSync(join(root, "public/avatar.png")).toString("base64")}`;

// Soft light blob rendered as a radial gradient (satori has no filter: blur).
const blob = (size: number, color: string, position: Record<string, number>): OgElement => ({
  type: "div",
  props: {
    style: {
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      ...position,
    },
  },
});

const element: OgElement = {
  type: "div",
  props: {
    style: {
      width: 1200,
      height: 630,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "M PLUS Rounded 1c",
      background: "linear-gradient(160deg, #1D4E89 0%, #173A6B 45%, #0A1830 100%)",
    },
    children: [
      blob(560, "rgba(56,189,248,.55)", { top: -160, left: -120 }),
      blob(480, "rgba(91,123,255,.5)", { bottom: -140, right: -80 }),
      blob(360, "rgba(56,189,248,.35)", { bottom: -80, left: 320 }),
      {
        type: "div",
        props: {
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
              type: "img",
              props: {
                src: avatar,
                width: 220,
                height: 220,
                style: {
                  borderRadius: "50%",
                  border: "3px solid rgba(255,255,255,.5)",
                  boxShadow: "0 8px 24px rgba(0,0,0,.25)",
                },
              },
            },
            {
              type: "div",
              props: {
                style: { display: "flex", flexDirection: "column", gap: 18 },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 76,
                        fontWeight: 700,
                        color: "rgba(255,255,255,.95)",
                        textShadow: "0 2px 6px rgba(0,0,0,.4)",
                      },
                      children: "じょうげん",
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 34,
                        color: "rgba(255,255,255,.88)",
                        textShadow: "0 1px 3px rgba(0,0,0,.4)",
                      },
                      children: "フルスタック趣味人",
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        marginTop: 10,
                        alignSelf: "flex-start",
                        display: "flex",
                        padding: "12px 32px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,.14)",
                        border: "1px solid rgba(255,255,255,.35)",
                        fontSize: 28,
                        letterSpacing: "0.08em",
                        color: "#BFE8FF",
                        textShadow: "0 1px 2px rgba(0,0,0,.4)",
                      },
                      children: "links.bmth.dev",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
};

const svg = await satori(element as unknown as ReactNode, {
  width: 1200,
  height: 630,
  // The japanese subset also covers basic latin, so it is the only subset
  // needed. Don't add the latin subset under the same name: satori shadows
  // fonts with an identical name+weight instead of falling back per glyph,
  // which silently drops all Japanese text.
  fonts: [
    {
      name: "M PLUS Rounded 1c",
      weight: 400,
      data: font("m-plus-rounded-1c-japanese-400-normal.woff"),
    },
    {
      name: "M PLUS Rounded 1c",
      weight: 700,
      data: font("m-plus-rounded-1c-japanese-700-normal.woff"),
    },
  ],
});

const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
writeFileSync(join(root, "public/og.png"), png);
console.log(`generated public/og.png (${png.length} bytes)`);
