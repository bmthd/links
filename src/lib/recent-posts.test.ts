import { describe, expect, it } from "vitest";
import { parseFeed, type RecentPost, selectRecentPosts } from "./recent-posts";

const zennLike = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
<title><![CDATA[じょうげんさんのフィード]]></title>
<link>https://zenn.dev/bmth</link>
<item><title><![CDATA[記事A]]></title><link>https://zenn.dev/bmth/articles/a</link><guid isPermaLink="true">https://zenn.dev/bmth/articles/a</guid><pubDate>Wed, 03 Jun 2026 10:57:46 GMT</pubDate></item>
<item><title><![CDATA[記事B]]></title><link>https://zenn.dev/bmth/articles/b</link><pubDate>Fri, 15 May 2026 09:39:14 GMT</pubDate></item>
</channel></rss>`;

const wordpressLike = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
<title>ブルーメソッド</title>
<link>https://blog.bmth.dev</link>
<item>
  <title>プレーンタイトル</title>
  <link>https://blog.bmth.dev/entry/plain</link>
  <pubDate>Sat, 17 Jun 2023 14:13:13 +0000</pubDate>
</item>
</channel></rss>`;

describe("parseFeed", () => {
  it("CDATAタイトルのZenn形式をパースし、チャンネル情報は拾わない", () => {
    const posts = parseFeed(zennLike, "Zenn");
    expect(posts).toEqual([
      {
        title: "記事A",
        url: "https://zenn.dev/bmth/articles/a",
        date: "2026-06-03T10:57:46.000Z",
        source: "Zenn",
      },
      {
        title: "記事B",
        url: "https://zenn.dev/bmth/articles/b",
        date: "2026-05-15T09:39:14.000Z",
        source: "Zenn",
      },
    ]);
  });

  it("プレーンタイトルのWordPress形式をパースする", () => {
    const posts = parseFeed(wordpressLike, "Blog");
    expect(posts).toEqual([
      {
        title: "プレーンタイトル",
        url: "https://blog.bmth.dev/entry/plain",
        date: "2023-06-17T14:13:13.000Z",
        source: "Blog",
      },
    ]);
  });

  it("必須フィールド欠落・不正日付のitemはスキップする", () => {
    const broken = `<rss><channel>
<item><title>リンクなし</title><pubDate>Sat, 17 Jun 2023 14:13:13 +0000</pubDate></item>
<item><title>日付不正</title><link>https://example.com/x</link><pubDate>not a date</pubDate></item>
<item><title>正常</title><link>https://example.com/ok</link><pubDate>Mon, 01 Jan 2024 00:00:00 +0000</pubDate></item>
</channel></rss>`;
    const posts = parseFeed(broken, "Blog");
    expect(posts.map((p) => p.title)).toEqual(["正常"]);
  });

  it("空文字列やXMLでない入力では空配列を返す(ビルドを落とさない)", () => {
    expect(parseFeed("", "Zenn")).toEqual([]);
    expect(parseFeed("<html>error page</html>", "Blog")).toEqual([]);
  });
});

const post = (source: RecentPost["source"], n: number, date: string): RecentPost => ({
  title: `${source}${n}`,
  url: `https://example.com/${source}/${n}`,
  date,
  source,
});

describe("selectRecentPosts", () => {
  const zenn = [1, 2, 3, 4, 5, 6].map((n) => post("Zenn", n, `2026-0${n}-01T00:00:00.000Z`));
  const blog = [1, 2, 3].map((n) => post("Blog", n, `2023-0${n}-01T00:00:00.000Z`));

  it("片方のソースが古くても最低2件は混ぜ、全体は日付降順で6件", () => {
    const result = selectRecentPosts([zenn, blog]);
    expect(result).toHaveLength(6);
    expect(result.filter((p) => p.source === "Blog")).toHaveLength(2);
    expect(result.filter((p) => p.source === "Zenn")).toHaveLength(4);
    const times = result.map((p) => new Date(p.date).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
    // Blog側も新しい順に2件
    expect(result.filter((p) => p.source === "Blog").map((p) => p.title)).toEqual([
      "Blog3",
      "Blog2",
    ]);
  });

  it("一方のフィードが空(取得失敗)ならもう一方だけで埋める", () => {
    const result = selectRecentPosts([zenn, []]);
    expect(result.map((p) => p.source)).toEqual(Array(6).fill("Zenn"));
  });

  it("両方空なら空配列(セクション非表示)", () => {
    expect(selectRecentPosts([[], []])).toEqual([]);
  });
});
