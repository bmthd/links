import { css } from "../styled-system/css";
import { avatarSrc } from "../generated/avatar";
import { profile } from "../lib/links";

export function ProfileCard() {
  return (
    <header
      className={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3",
        textAlign: "center",
      })}
    >
      <img
        src={avatarSrc}
        alt=""
        width={96}
        height={96}
        // LCP element: inlined as a data URI (no fetch on the critical path)
        // and no data-fade — an image has no glyphs, so the FOUT gate would
        // only delay LCP for nothing.
        className={css({
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,.5)",
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        })}
      />
      <h1 data-fade className={css({ fontSize: "2xl", fontWeight: "700" })}>
        {profile.name}
      </h1>
      <p data-fade className={css({ color: "textDim", fontSize: "sm" })}>
        {profile.bio}
      </p>
    </header>
  );
}
