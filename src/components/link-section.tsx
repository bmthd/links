import { css, cx } from '../styled-system/css';
import type { LinkSection } from '../lib/links';

export function LinkSectionBlock({ section }: { section: LinkSection }) {
  return (
    <section
      className={css({ display: 'flex', flexDirection: 'column', gap: '3', width: '100%' })}
    >
      {section.heading && (
        <h2
          className={css({
            textAlign: 'center',
            fontSize: 'xs',
            fontWeight: '700',
            letterSpacing: '.25em',
            color: 'textDim',
            marginTop: '2',
          })}
        >
          {section.heading}
        </h2>
      )}
      {section.items.map((item) => (
        <a
          key={item.url}
          href={item.url}
          target="_blank"
          rel="noopener"
          className={cx(
            'glass',
            css({
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '999px',
              paddingY: '3.5',
              paddingX: '6',
              fontWeight: '700',
              color: { base: '#fff', _osLight: '#0F2A4A' },
              textShadow: { base: '0 1px 2px rgba(0,0,0,.2)', _osLight: 'none' },
              transition: 'transform .2s ease, filter .2s ease',
              _hover: { transform: 'scale(1.03)', filter: 'brightness(1.12)' },
              _motionReduce: { transition: 'none', _hover: { transform: 'none' } },
            }),
          )}
        >
          {item.label}
        </a>
      ))}
    </section>
  );
}
