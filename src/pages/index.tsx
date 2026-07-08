import { css } from '../styled-system/css';
import { Background } from '../components/background';
import { ProfileCard } from '../components/profile-card';
import { LinkSectionBlock } from '../components/link-section';
import { sections } from '../lib/links';

const DESCRIPTION = 'じょうげんのリンク集。SNS・Webアプリ・同人誌の入り口をまとめています。';

export default async function HomePage() {
  return (
    <>
      <title>じょうげん | links</title>
      <meta name="description" content={DESCRIPTION} />
      <meta property="og:title" content="じょうげん | links" />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content="https://links.bmth.dev/" />
      <meta property="og:image" content="https://links.bmth.dev/avatar.png" />
      <meta name="twitter:card" content="summary" />
      <link rel="icon" href="/avatar.png" />
      <Background />
      <main
        className={css({
          maxWidth: '28rem',
          marginX: 'auto',
          paddingX: '5',
          paddingY: '12',
          display: 'flex',
          flexDirection: 'column',
          gap: '6',
        })}
      >
        <ProfileCard />
        {sections.map((section, i) => (
          <LinkSectionBlock key={section.heading ?? i} section={section} />
        ))}
      </main>
    </>
  );
}

export const getConfig = async () => {
  return { render: 'static' } as const;
};
