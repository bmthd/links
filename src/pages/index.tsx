export default async function HomePage() {
  return <main>hello links</main>;
}

export const getConfig = async () => {
  return { render: 'static' } as const;
};
