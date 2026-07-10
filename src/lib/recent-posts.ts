export type RecentPostSource = "Zenn" | "Blog";

export type RecentPost = {
  readonly title: string;
  readonly url: string;
  /** ISO 8601 date string. */
  readonly date: string;
  readonly source: RecentPostSource;
};

const FEEDS: readonly { url: string; source: RecentPostSource }[] = [
  { url: "https://zenn.dev/bmth/feed", source: "Zenn" },
  { url: "https://blog.bmth.dev/feed", source: "Blog" },
];

// The blog runs on a 1GB-RAM WordPress box that has been measured taking
// ~20s to serve /feed under load, so give it a generous timeout and one
// retry before giving up. Worst case this adds ~1 minute to the (daily,
// scheduled) static build, which is acceptable; the Zenn fetch runs in
// parallel and is unaffected.
const FETCH_TIMEOUT_MS = 30_000;
const FETCH_ATTEMPTS = 2;

const ITEM_RE = /<item>([\s\S]*?)<\/item>/g;
const TITLE_RE = /<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/;
const LINK_RE = /<link>([\s\S]*?)<\/link>/;
const PUB_DATE_RE = /<pubDate>([\s\S]*?)<\/pubDate>/;

/**
 * Minimal, dependency-free RSS 2.0 `<item>` parser. Only extracts the three
 * fields the UI needs (title / link / pubDate); items with malformed or
 * missing fields are skipped rather than thrown, so a partially broken feed
 * still yields whatever parsed cleanly.
 */
export function parseFeed(xml: string, source: RecentPostSource): RecentPost[] {
  const posts: RecentPost[] = [];
  for (const match of xml.matchAll(ITEM_RE)) {
    const block = match[1] ?? "";
    const titleMatch = TITLE_RE.exec(block);
    const title = (titleMatch?.[1] ?? titleMatch?.[2])?.trim();
    const url = LINK_RE.exec(block)?.[1]?.trim();
    const rawDate = PUB_DATE_RE.exec(block)?.[1]?.trim();
    if (!title || !url || !rawDate) continue;
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) continue;
    posts.push({ title, url, date: date.toISOString(), source });
  }
  return posts;
}

const byDateDesc = (a: RecentPost, b: RecentPost) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

/**
 * Merges per-feed post lists into the display list: up to `limit` posts,
 * newest first, but with `minPerSource` slots reserved per feed so a feed
 * whose newest entry is old (the blog updates far less often than Zenn)
 * still appears instead of being crowded out by the strict date sort.
 * Reserved slots left unused by a short/empty feed fall back to the
 * remaining posts by date.
 */
export function selectRecentPosts(
  feeds: readonly (readonly RecentPost[])[],
  limit = 6,
  minPerSource = 2,
): RecentPost[] {
  const sorted = feeds.map((posts) => [...posts].sort(byDateDesc));
  const reserved = sorted.flatMap((posts) => posts.slice(0, minPerSource));
  const rest = sorted.flatMap((posts) => posts.slice(minPerSource)).sort(byDateDesc);
  return [...reserved, ...rest].slice(0, limit).sort(byDateDesc);
}

async function fetchFeed({
  url,
  source,
}: {
  url: string;
  source: RecentPostSource;
}): Promise<RecentPost[]> {
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parseFeed(await res.text(), source);
    } catch (error) {
      console.warn(
        `[recent-posts] failed to fetch ${source} feed (${url}, attempt ${attempt}/${FETCH_ATTEMPTS}):`,
        error,
      );
    }
  }
  return [];
}

/**
 * Fetches the Zenn + blog RSS feeds (build time only; called from a static
 * RSC page) and returns the posts to display.
 *
 * Fail-safe by construction: each feed is fetched and parsed independently
 * with its own catch, so a feed being down never throws and never fails the
 * build -- it just contributes zero posts. Callers should treat an empty
 * result as "render nothing", not as an error.
 */
export async function fetchRecentPosts(): Promise<RecentPost[]> {
  return selectRecentPosts(await Promise.all(FEEDS.map(fetchFeed)));
}
