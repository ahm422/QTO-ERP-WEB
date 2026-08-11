import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from "../src/lib/jwt";
import { roles } from "../src/db/enums";

async function main() {
  for (const role of roles) {
    const token = await signAccessToken({ sub: "user_abc", role });
    const verified = await verifyAccessToken(token);
    console.assert(verified?.sub === "user_abc", `${role}: sign/verify failed`);
    console.assert(verified?.role === role, `${role}: role claim mismatch`);
  }

  const raw = generateRefreshToken();
  const h1 = await hashRefreshToken(raw);
  const h2 = await hashRefreshToken(raw);
  console.assert(h1 === h2 && h1.length === 64, "refresh hash not deterministic/64 hex");

  const adminToken = await signAccessToken({ sub: "user_abc", role: "ADMIN" });
  console.assert(
    (await verifyAccessToken(adminToken + "x")) === null,
    "tampered token should return null",
  );

  console.log("All JWT sanity checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
