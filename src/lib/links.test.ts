import { describe, expect, it } from "vitest";
import { profile, sameAs, sections } from "./links";

const allItems = sections.flatMap((s) => s.items);

describe("profile", () => {
  it("名前・bio が仕様どおり", () => {
    expect(profile.name).toBe("じょうげん");
    expect(profile.bio).toBe("フルスタック趣味人");
  });
});

describe("sections", () => {
  it("SNS(見出しなし)→ WORKS → DOUJINSHI の3セクション", () => {
    expect(sections.map((s) => s.heading)).toEqual([undefined, "WORKS", "DOUJINSHI"]);
    expect(sections.map((s) => s.items.length)).toEqual([4, 4, 2]);
  });

  it("全URLが有効な https で重複なし", () => {
    for (const { url } of allItems) {
      expect(new URL(url).protocol).toBe("https:");
    }
    expect(new Set(allItems.map((i) => i.url)).size).toBe(allItems.length);
  });

  it("ラベルが空でなく重複なし", () => {
    for (const { label } of allItems) {
      expect(label.trim().length).toBeGreaterThan(0);
    }
    expect(new Set(allItems.map((i) => i.label)).size).toBe(allItems.length);
  });

  it("me:true は見出しなし(SNS)セクションのリンクだけ", () => {
    for (const s of sections) {
      const allMe = s.items.every((i) => i.me);
      const noneMe = s.items.every((i) => !i.me);
      expect(s.heading === undefined ? allMe : noneMe).toBe(true);
    }
  });
});

describe("sameAs", () => {
  it("me:true のURLと一致する", () => {
    expect(sameAs).toEqual(allItems.filter((i) => i.me).map((i) => i.url));
  });
});
