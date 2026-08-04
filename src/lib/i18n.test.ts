import { describe, expect, it } from "vitest";
import {
  type Locale,
  defaultLocale,
  localeMeta,
  localePath,
  locales,
  ogImagePath,
  translator,
  ui,
} from "./i18n";

describe("locales", () => {
  it("既定ロケールは先頭で、重複がない", () => {
    expect(locales[0]).toBe(defaultLocale);
    expect(new Set(locales).size).toBe(locales.length);
  });

  it("既定ロケールだけがルートパス、他は接頭辞付き(末尾スラッシュなし)", () => {
    expect(localePath(defaultLocale)).toBe("/");
    for (const locale of locales.filter((l) => l !== defaultLocale)) {
      expect(localePath(locale)).toBe(`/${locale}`);
    }
    expect(new Set(locales.map(localePath)).size).toBe(locales.length);
  });

  it("OG画像のパスがロケールごとに一意", () => {
    expect(ogImagePath(defaultLocale)).toBe("/og.png");
    expect(new Set(locales.map(ogImagePath)).size).toBe(locales.length);
  });

  it("localeMeta が全ロケール分そろっている", () => {
    for (const locale of locales) {
      expect(localeMeta[locale].short.trim().length).toBeGreaterThan(0);
      expect(localeMeta[locale].switchLabel.trim().length).toBeGreaterThan(0);
      expect(localeMeta[locale].ogLocale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });
});

describe("translator", () => {
  it("素の文字列は全ロケールでそのまま(固有名詞用)", () => {
    for (const locale of locales) {
      expect(translator(locale)("BOOTH")).toBe("BOOTH");
    }
  });

  it("レコードは該当ロケールの訳を返す", () => {
    const value = { ja: "テーマ切り替え", en: "Toggle theme" };
    expect(translator("ja")(value)).toBe("テーマ切り替え");
    expect(translator("en")(value)).toBe("Toggle theme");
  });
});

describe("ui", () => {
  // 型上は必須だが、空文字やコピー漏れ(全ロケール同一)は型では防げない
  it.each(locales)("%s の文言が空でない", (locale: Locale) => {
    const t = translator(locale);
    for (const value of Object.values(ui)) {
      expect(t(value).trim().length).toBeGreaterThan(0);
    }
  });

  it("description はロケールごとに異なる", () => {
    const descriptions = locales.map((locale) => translator(locale)(ui.description));
    expect(new Set(descriptions).size).toBe(locales.length);
  });
});
