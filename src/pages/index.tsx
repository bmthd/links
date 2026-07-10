import { css } from "../styled-system/css";
import { Background } from "../components/background";
import { ProfileCard } from "../components/profile-card";
import { LinkSectionBlock } from "../components/link-section";
import { ThemeToggle } from "../components/theme-toggle";
import { sections } from "../lib/links";

const DESCRIPTION = "じょうげんのリンク集。SNS・Webアプリ・同人誌の入り口をまとめています。";

export default async function HomePage() {
  return (
    <>
      <title>じょうげん | links</title>
      <meta name="description" content={DESCRIPTION} />
      <meta property="og:title" content="じょうげん | links" />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content="https://links.bmth.dev/" />
      <meta property="og:image" content="https://links.bmth.dev/og.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="icon" href="/avatar.png" />
      <Background />
      <ThemeToggle />
      <main
        data-fade
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
        <ProfileCard />
        {sections.map((section, i) => (
          <LinkSectionBlock key={section.heading ?? i} section={section} />
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
        Made by じょうげん ·{" "}
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
