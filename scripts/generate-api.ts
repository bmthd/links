// Writes the public profile API (src/lib/profile-api.ts) to
// public/profile.json. Output is gitignored, like og.png.
//
// Runs directly with `node scripts/generate-api.ts` (type stripping), so only
// erasable TypeScript syntax is used.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildProfileApi, profileApiPath } from "../src/lib/profile-api.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", profileApiPath);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(buildProfileApi(), null, 2)}\n`);
console.log(`generated ${join("public", profileApiPath)}`);
