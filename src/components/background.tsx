import { css } from "../styled-system/css";

// Low blur keeps the blobs crisp enough for their drift to be perceptible,
// matching the confirmed mock (docs/reference/final-liquid-mock.html renders
// sharp circles); the previous blur(90px) smeared them into a static haze.
const blobBase = {
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(16px)",
  opacity: 0.5,
  _motionReduce: { animation: "none" },
} as const;

export function Background() {
  return (
    <div
      aria-hidden
      className={css({
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: -1,
        // The page gradient lives here — a fixed, viewport-sized layer —
        // rather than on <body> with `background-attachment: fixed`, which
        // iOS Safari ignores (see the html/body globalCss in panda.config.ts).
        backgroundGradient: "page",
      })}
    >
      <div
        className={css({
          ...blobBase,
          top: "8%",
          left: "12%",
          width: "340px",
          height: "340px",
          background: "accent",
          animation: "float1 9s ease-in-out infinite",
        })}
      />
      <div
        className={css({
          ...blobBase,
          top: "45%",
          right: "8%",
          width: "300px",
          height: "300px",
          background: "accentSub",
          animation: "float2 11s ease-in-out infinite",
        })}
      />
      <div
        className={css({
          ...blobBase,
          bottom: "5%",
          left: "25%",
          width: "260px",
          height: "260px",
          background: "accent",
          opacity: 0.4,
          animation: "float3 10s ease-in-out infinite",
        })}
      />
    </div>
  );
}
