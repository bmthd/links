import * as v from "valibot";

export const RECENT_POST_SOURCES = ["Zenn", "Blog"] as const;

/**
 * Validation + normalization schema for a single feed item. XML extraction is
 * done with regex below (valibot is a data-validation library, not an XML
 * parser); this schema turns the loosely-typed regex captures into a
 * `RecentPost`, coercing the RFC-822 `pubDate` into an ISO string and rejecting
 * items whose fields are missing, blank, non-URL, or an unparsable date. A
 * failed parse skips the item rather than throwing, keeping a partially broken
 * feed usable.
 */
export const RecentPostSchema = v.object({
  title: v.pipe(v.string(), v.trim(), v.nonEmpty()),
  url: v.pipe(v.string(), v.trim(), v.url()),
  date: v.pipe(
    v.string(),
    v.trim(),
    v.transform((raw) => new Date(raw)),
    v.check((d) => !Number.isNaN(d.getTime()), "invalid pubDate"),
    v.transform((d) => d.toISOString()),
  ),
  source: v.picklist(RECENT_POST_SOURCES),
});

export type RecentPostSource = (typeof RECENT_POST_SOURCES)[number];

export type RecentPost = v.InferOutput<typeof RecentPostSchema>;

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
 * Minimal, dependency-light RSS 2.0 `<item>` parser. Regex pulls the three
 * fields the UI needs (title / link / pubDate) out of each `<item>`, then
 * `RecentPostSchema` validates and normalizes them; items that fail the schema
 * (missing/blank field, non-URL link, unparsable date) are skipped rather than
 * thrown, so a partially broken feed still yields whatever parsed cleanly.
 */
export function parseFeed(xml: string, source: RecentPostSource): RecentPost[] {
  const posts: RecentPost[] = [];
  for (const match of xml.matchAll(ITEM_RE)) {
    const block = match[1] ?? "";
    const titleMatch = TITLE_RE.exec(block);
    const result = v.safeParse(RecentPostSchema, {
      title: titleMatch?.[1] ?? titleMatch?.[2],
      url: LINK_RE.exec(block)?.[1],
      date: PUB_DATE_RE.exec(block)?.[1],
      source,
    });
    if (result.success) posts.push(result.output);
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
