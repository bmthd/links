import type { ReactNode } from 'react';
import '@fontsource/m-plus-rounded-1c/400.css';
import '@fontsource/m-plus-rounded-1c/700.css';
import '../styles.css';

export default async function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const getConfig = async () => {
  return { render: 'static' } as const;
};
