import { Site } from "../components/site";
import { defaultLocale } from "../lib/i18n";

// The default locale is served at the bare root path, so the site's original
// URL keeps rendering japanese. Every other locale lives under /<locale>/ —
// see src/pages/en/index.tsx.
export default async function HomePage() {
  return <Site locale={defaultLocale} />;
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
