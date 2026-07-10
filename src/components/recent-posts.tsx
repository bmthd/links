import { css, cx } from "../styled-system/css";
import { fetchRecentPosts } from "../lib/recent-posts";

const dateFormat = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeZone: "Asia/Tokyo",
});

// Async server component: the RSS fetch runs once at build time (the page is
// `render: "static"`). When both feeds fail, fetchRecentPosts returns [] and
// the whole section is omitted -- the build still succeeds.
export async function RecentPosts() {
  const posts = await fetchRecentPosts();
  if (posts.length === 0) {
    console.warn("[recent-posts] no posts fetched; omitting RECENT POSTS section");
    return null;
  }
  return (
    <section className={css({ display: "flex", flexDirection: "column", gap: "2", width: "100%" })}>
      <h2
        className={css({
          textAlign: "center",
          fontSize: "xs",
          fontWeight: "700",
          letterSpacing: ".25em",
          color: "textDim",
          marginTop: "2",
          marginBottom: "1",
        })}
      >
        RECENT POSTS
      </h2>
      {posts.map((post) => (
        <a
          key={post.url}
          href={post.url}
          target="_blank"
          rel="noopener"
          className={cx(
            "glass",
            css({
              display: "flex",
              flexDirection: "column",
              gap: "1",
              borderRadius: "xl",
              paddingY: "2.5",
              paddingX: "4",
              transition: "transform .2s ease, filter .2s ease",
              _hover: { transform: "scale(1.02)", filter: "brightness(1.12)" },
              _motionReduce: { transition: "none", _hover: { transform: "none" } },
            }),
          )}
        >
          <span
            className={css({
              fontSize: "sm",
              lineHeight: "1.5",
              color: { base: "#fff", _light: "#0F2A4A" },
              textShadow: { base: "0 1px 2px rgba(0,0,0,.2)", _light: "none" },
            })}
          >
            {post.title}
          </span>
          <span
            className={css({
              display: "flex",
              gap: "2",
              alignItems: "center",
              fontSize: "xs",
              color: "textDim",
            })}
          >
            <span>{dateFormat.format(new Date(post.date))}</span>
            <span aria-hidden>·</span>
            <span>{post.source}</span>
          </span>
        </a>
      ))}
    </section>
  );
}
