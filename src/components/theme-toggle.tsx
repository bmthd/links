"use client";

import { Moon, Sun } from "lucide-react";
import { css, cx } from "../styled-system/css";

// The current theme lives in `data-theme` on <html> (set before paint by the
// inline script in _root.tsx). The icon is switched purely in CSS from that
// attribute, so the server-rendered markup never depends on the theme and
// there is no hydration mismatch.
function applyTheme(next: "light" | "dark") {
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
}

// Reveals the incoming theme with a clip-path circle growing from the button,
// falling back to an instant swap without View Transitions or under reduced motion.
function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!document.startViewTransition || prefersReducedMotion) {
    applyTheme(next);
    return;
  }

  // Center on the button so keyboard activation (clientX/Y 0,0) reveals too.
  const rect = event.currentTarget.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = document.startViewTransition(() => applyTheme(next));
  transition.ready.then(() => {
    root.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
      },
      {
        duration: 550,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="テーマ切り替え"
      data-fade
      onClick={toggleTheme}
      className={cx(
        "glass",
        css({
          position: "fixed",
          top: "4",
          right: "4",
          zIndex: 10,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "lg",
          color: { base: "#fff", _light: "#0F2A4A" },
          cursor: "pointer",
          // Includes `opacity .3s ease-out` (matching the `[data-fade]` global
          // rule in panda.config.ts) because this inline `transition` shorthand
          // otherwise wins the cascade over that rule and drops opacity from
          // the button's transition-property list entirely, making the FOUT
          // fade-in (see FONT_FADE_INIT_SCRIPT in _root.tsx) snap instantly
          // instead of fading.
          transition: "opacity .3s ease-out, transform .2s ease, filter .2s ease",
          _hover: { transform: "scale(1.08)", filter: "brightness(1.12)" },
          _motionReduce: { transition: "none", _hover: { transform: "none" } },
        }),
      )}
    >
      <Moon
        aria-hidden
        size={20}
        className={css({ display: "block", _light: { display: "none" } })}
      />
      <Sun
        aria-hidden
        size={20}
        className={css({ display: "none", _light: { display: "block" } })}
      />
    </button>
  );
}
