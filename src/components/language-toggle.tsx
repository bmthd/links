import { css, cx } from "../styled-system/css";
import { type Locale, localeMeta, localePath, locales } from "../lib/i18n";

// A plain <a> per other locale, not a button: switching language is a
// navigation to a different static document (each locale has its own HTML with
// its own `lang`), so it must work with JS disabled and before hydration —
// which this page defers until after window load (see scripts/optimize-html.ts).
//
// Placement comes from the row in src/pages/index.tsx, which holds this and the
// theme toggle; this element only spaces its own links.
export function LanguageToggle({ locale }: { locale: Locale }) {
  return (
    <nav
      className={css({
        display: "flex",
        gap: "2",
      })}
    >
      {locales
        .filter((other) => other !== locale)
        .map((other) => (
          <a
            key={other}
            href={localePath(other)}
            hrefLang={other}
            aria-label={localeMeta[other].switchLabel}
            data-fade
            className={cx(
              "glass",
              css({
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "xs",
                fontWeight: "700",
                letterSpacing: ".08em",
                color: { base: "#fff", _light: "#0F2A4A" },
                // Includes `opacity .3s ease-out` for the same reason as the
                // theme toggle — see the comment in theme-toggle.tsx.
                transition: "opacity .3s ease-out, transform .2s ease, filter .2s ease",
                _hover: { transform: "scale(1.08)", filter: "brightness(1.12)" },
                _motionReduce: { transition: "none", _hover: { transform: "none" } },
              }),
            )}
          >
            {localeMeta[other].short}
          </a>
        ))}
    </nav>
  );
}
