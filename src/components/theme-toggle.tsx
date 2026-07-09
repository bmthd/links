"use client";

import { Moon, Sun } from "lucide-react";
import { css, cx } from "../styled-system/css";

// The current theme lives in `data-theme` on <html> (set before paint by the
// inline script in _root.tsx). The icon is switched purely in CSS from that
// attribute, so the server-rendered markup never depends on the theme and
// there is no hydration mismatch.
function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("theme", next);
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
