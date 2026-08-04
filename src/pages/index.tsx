import { css } from "../styled-system/css";
import { Background } from "../components/background";
import { LanguageToggle } from "../components/language-toggle";
import { LinkSectionBlock } from "../components/link-section";
import { ProfileCard } from "../components/profile-card";
import { ThemeToggle } from "../components/theme-toggle";
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

// The page itself, served at the bare root path in the default locale so the
// site's original URL keeps rendering japanese. Every other locale lives under
// /<locale>/ and reuses this component with `locale` overridden — see
// src/pages/en/index.tsx.
export default async function HomePage({ locale = defaultLocale }: { locale?: Locale }) {
  const t = translator(locale);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: t(profile.name),
    url: localeUrl(localePath(locale)),
    sameAs,
  };

  return (
    <>
      <title>{`${t(profile.name)} | links`}</title>
      <meta name="description" content={t(ui.description)} />
      <meta property="og:title" content={`${t(profile.name)} | links`} />
      <meta property="og:description" content={t(ui.description)} />
      <meta property="og:url" content={localeUrl(localePath(locale))} />
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
      <link rel="canonical" href={localeUrl(localePath(locale))} />
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
      {/* Both controls are pinned to the top of the PAGE, not the viewport:
          `absolute` resolves against the initial containing block (no ancestor
          is positioned), so they sit in the same top-right corner as before at
          scroll 0 but scroll away with the content instead of following it.
          Positioning them together as one row also means the language toggle
          does not have to know the theme button's width. */}
      <div
        className={css({
          position: "absolute",
          top: "4",
          right: "4",
          zIndex: 10,
          display: "flex",
          gap: "2",
        })}
      >
        <LanguageToggle locale={locale} />
        <ThemeToggle label={t(ui.themeToggle)} />
      </div>
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
        {`${t(ui.madeBy)} ${t(profile.name)} · `}
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

export const getConfig = async () => {
  return { render: "static" } as const;
};
