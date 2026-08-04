import HomePage from "../index";

// Maps to /en/ through waku's fsRouter (see src/waku.server.tsx). The page is
// the root one with only `locale` overridden, so adding a locale is this file
// copied for the new locale after adding it to `locales` in src/lib/i18n.ts.
export default async function EnHomePage() {
  return <HomePage locale="en" />;
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
