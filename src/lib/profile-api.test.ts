import { describe, expect, it } from "vitest";
import { locales } from "./i18n";
import { sameAs, sections } from "./links";
import { buildProfileApi } from "./profile-api";

const api = buildProfileApi();

describe("buildProfileApi", () => {
  it("名前と bio を全ロケール分そろえて出す", () => {
    expect(api.name).toEqual({ ja: "じょうげん", en: "Jougen" });
    expect(Object.keys(api.bio)).toEqual([...locales]);
  });

  it("固有名詞のラベルも全ロケール分の形にする", () => {
    const x = api.sections[0]?.items[0];
    expect(x?.label).toEqual({ ja: "X", en: "X" });
    expect(x?.me).toBe(true);
  });

  it("セクションとリンクをページと同じ順で出す", () => {
    expect(api.sections.map((s) => s.items.map((i) => i.url))).toEqual(
      sections.map((s) => s.items.map((i) => i.url)),
    );
    expect(api.sections[0]?.heading).toBeNull();
    expect(api.sameAs).toEqual(sameAs);
  });

  it("各セクションに id を付け、works を名前で取り出せる", () => {
    expect(api.sections.map((s) => s.id)).toEqual(["sns", "works", "doujinshi"]);
    const works = api.sections.find((s) => s.id === "works");
    expect(works?.heading).toEqual({ ja: "WORKS", en: "WORKS" });
    expect(works?.items.map((i) => i.url)).toContain("https://point-sprint.bmth.dev/");
  });

  it("アバターは絶対 URL", () => {
    for (const a of api.avatar) {
      expect(a.url).toBe(new URL(a.path, "https://links.bmth.dev/").href);
    }
  });
});
