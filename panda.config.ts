import { defineConfig, defineGlobalStyles } from '@pandacss/dev';

const globalCss = defineGlobalStyles({
  body: {
    fontFamily: "'M PLUS Rounded 1c', sans-serif",
    minHeight: '100dvh',
    color: 'text',
    backgroundGradient: 'page',
    backgroundAttachment: 'fixed',
  },
  '.glass': {
    background: 'rgba(255,255,255,.12)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255,255,255,.3)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 1px rgba(255,255,255,.08), 0 8px 24px rgba(0,0,0,.25)',
    '@media (prefers-color-scheme: light)': {
      background: 'rgba(255,255,255,.45)',
      border: '1px solid rgba(255,255,255,.65)',
    },
    '@supports not (backdrop-filter: blur(1px))': {
      background: 'rgba(30,62,110,.92)',
      '@media (prefers-color-scheme: light)': {
        background: 'rgba(255,255,255,.92)',
      },
    },
  },
});

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{ts,tsx}'],
  exclude: ['./src/styled-system/**'],
  outdir: 'src/styled-system',
  globalCss,
  theme: {
    extend: {
      keyframes: {
        float1: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(28px, -36px)' },
        },
        float2: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-32px, 24px)' },
        },
        float3: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, 32px)' },
        },
      },
      semanticTokens: {
        colors: {
          text: {
            value: { base: 'rgba(255,255,255,.92)', _osLight: '#0F2A4A' },
          },
          textDim: {
            value: { base: '#BFE8FF', _osLight: '#33557F' },
          },
          accent: { value: '#38BDF8' },
          accentSub: { value: '#5B7BFF' },
        },
        gradients: {
          page: {
            value: {
              base: 'linear-gradient(160deg, #1D4E89 0%, #173A6B 45%, #0A1830 100%)',
              _osLight: 'linear-gradient(160deg, #BFE0FF 0%, #DCEEFF 45%, #F4FAFF 100%)',
            },
          },
        },
      },
    },
  },
});
