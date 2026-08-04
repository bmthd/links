import { css } from "../styled-system/css";
import { Background } from "./background";
import { LanguageToggle } from "./language-toggle";
import { LinkSectionBlock } from "./link-section";
import { ProfileCard } from "./profile-card";
import { ThemeToggle } from "./theme-toggle";
import {
  type Locale,
  defaultLocale,
  localeMeta,
  localePath,
  locales,
  ogImagePath,
  translator,
  ui,
} from "../lib/i18n";
import { localeUrl, profile, sameAs, sections } from "../lib/links";

// The whole page, rendered once per locale. src/pages/index.tsx and
// src/pages/en/index.tsx are thin wrappers that only pick the locale, so
// adding a locale is one new page file plus its dictionary entries.
export function Site({ locale }: { locale: Locale }) {
  const t = translator(locale);
  const name = t(profile.name);
  const title = `${name} | links`;
  const description = t(ui.description);
  const url = localeUrl(localePath(locale));

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    sameAs,
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={localeUrl(ogImagePath(locale))} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={localeMeta[locale].ogLocale} />
      {locales
        .filter((other) => other !== locale)
        .map((other) => (
          <meta key={other} property="og:locale:alternate" content={localeMeta[other].ogLocale} />
        ))}
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={url} />
      {/* Each locale points at every locale (itself included) so search engines
          can pair the documents; x-default goes to the default locale, which is
          the one served at the bare root path. */}
      {locales.map((other) => (
        <link key={other} rel="alternate" hrefLang={other} href={localeUrl(localePath(other))} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={localeUrl(localePath(defaultLocale))} />
      <link rel="icon" href="/avatar-96.png" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Background />
      <LanguageToggle locale={locale} />
      <ThemeToggle label={t(ui.themeToggle)} />
      {/* No data-fade on <main>: the FOUT gate (see _root.tsx) is only about
          text, and the LCP element — the avatar <img> in ProfileCard — must
          not wait for fonts. The fade markers sit on the text blocks inside
          (ProfileCard's h1/p, each LinkSectionBlock, the footer). */}
      <main
        className={css({
          maxWidth: "28rem",
          marginX: "auto",
          paddingX: "5",
          paddingY: "12",
          display: "flex",
          flexDirection: "column",
          gap: "6",
        })}
      >
        <ProfileCard locale={locale} />
        {sections.map((section, i) => (
          <LinkSectionBlock
            key={section.heading ? t(section.heading) : `section-${i}`}
            section={section}
            locale={locale}
          />
        ))}
      </main>
      <footer
        data-fade
        className={css({
          textAlign: "center",
          color: "textDim",
          fontSize: "xs",
          paddingBottom: "8",
        })}
      >
        {`${t(ui.madeBy)} ${name} · `}
        <a
          href="https://github.com/bmthd/links"
          target="_blank"
          rel="noopener"
          className={css({ textDecoration: "underline", _hover: { color: "text" } })}
        >
          bmthd/links
        </a>
      </footer>
    </>
  );
}
