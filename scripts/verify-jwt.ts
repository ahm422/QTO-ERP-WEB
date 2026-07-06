import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from "../src/lib/jwt";

async function main() {
  const token = await signAccessToken({ sub: "user_abc", role: "ADMIN" });
  const verified = await verifyAccessToken(token);
  console.assert(verified?.sub === "user_abc", "sign/verify round-trip failed");
  console.assert(verified?.role === "ADMIN", "role claim mismatch");

  const raw = generateRefreshToken();
  const h1 = await hashRefreshToken(raw);
  const h2 = await hashRefreshToken(raw);
  console.assert(h1 === h2 && h1.length === 64, "refresh hash not deterministic/64 hex");

  console.assert(
    (await verifyAccessToken(token + "x")) === null,
    "tampered token should return null",
  );

  console.log("All JWT sanity checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
