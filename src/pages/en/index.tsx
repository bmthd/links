import { Site } from "../../components/site";

// Maps to /en/ through waku's fsRouter (see src/waku.server.tsx). Adding a
// locale means copying this file to src/pages/<locale>/index.tsx after adding
// the locale to `locales` in src/lib/i18n.ts.
export default async function EnHomePage() {
  return <Site locale="en" />;
}

export const getConfig = async () => {
  return { render: "static" } as const;
};
