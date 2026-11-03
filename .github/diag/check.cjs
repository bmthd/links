const { chromium, webkit } = require("playwright");
(async () => {
  const b = await chromium.launch();
  for (const scheme of ["dark", "light"]) {
    const p = await b.newPage({ colorScheme: scheme });
    p.on("console", (m) => console.log(scheme, "console", m.type(), m.text().slice(0, 500)));
    p.on("pageerror", (e) => console.log(scheme, "pageerror", e.stack));
    p.on("requestfailed", (r) => console.log(scheme, "failed", r.url(), r.failure()?.errorText));
    p.on("response", (r) => console.log(scheme, "res", r.status(), r.headers()["content-type"], r.url()));
    await p.goto("https://links.bmth.dev/");
    for (const t of [300, 1500, 5000]) {
      await p.waitForTimeout(t);
      const s = await p.evaluate(() => ({
        charset: document.characterSet,
        theme: document.documentElement.dataset.theme,
        fonts: document.documentElement.dataset.fonts,
        bodyChildren: document.body?.children.length,
        styles: document.querySelectorAll("style").length,
        links: [...document.querySelectorAll("link[rel=stylesheet]")].map((l) => l.href),
        text: document.body?.innerText.slice(0, 200),
        html: document.body?.innerHTML.slice(0, 600),
      }));
      console.log(scheme, "state@", t, JSON.stringify(s));
    }
    await p.close();
  }
  await b.close();
})();
