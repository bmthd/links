import { css } from '../styled-system/css';

const blobBase = {
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(90px)',
  opacity: 0.5,
  _motionReduce: { animation: 'none' },
} as const;

export function Background() {
  return (
    <div
      aria-hidden
      className={css({
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        zIndex: -1,
      })}
    >
      <div
        className={css({
          ...blobBase,
          top: '8%',
          left: '12%',
          width: '340px',
          height: '340px',
          background: 'accent',
          animation: 'float1 9s ease-in-out infinite',
        })}
      />
      <div
        className={css({
          ...blobBase,
          top: '45%',
          right: '8%',
          width: '300px',
          height: '300px',
          background: 'accentSub',
          animation: 'float2 11s ease-in-out infinite',
        })}
      />
      <div
        className={css({
          ...blobBase,
          bottom: '5%',
          left: '25%',
          width: '260px',
          height: '260px',
          background: 'accent',
          opacity: 0.35,
          animation: 'float3 10s ease-in-out infinite',
        })}
      />
    </div>
  );
}
