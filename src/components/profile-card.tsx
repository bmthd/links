import { css } from "../styled-system/css";
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
        src={profile.avatar}
        alt=""
        width={96}
        height={96}
        className={css({
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,.5)",
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        })}
      />
      <h1 className={css({ fontSize: "2xl", fontWeight: "700" })}>{profile.name}</h1>
      <p className={css({ color: "textDim", fontSize: "sm" })}>{profile.bio}</p>
    </header>
  );
}
