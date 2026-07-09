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

// Toggle the theme with an "おしゃれ" reveal: the incoming theme is wiped in
// as a clip-path circle expanding from the toggle button. Falls back to an
// instant swap when the View Transitions API is unavailable or the user
// prefers reduced motion, so no one is left without a working toggle.
function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!document.startViewTransition || prefersReducedMotion) {
    applyTheme(next);
    return;
  }

  // Emanate the reveal from the button's center so it works for pointer and
  // keyboard activation alike (a keyboard click reports 0,0 for clientX/Y).
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
          transition: "transform .2s ease, filter .2s ease",
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
