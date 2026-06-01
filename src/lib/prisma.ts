import { PrismaClient } from "@prisma/client";

/** Bump when adding Prisma models so dev clears a stale `globalThis` client. */
const PRISMA_CLIENT_VERSION = 1;

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClient;
  prismaClientVersion?: number;
};

const globalForPrisma = globalThis as PrismaGlobal;

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function assertClientHasAllModels(client: PrismaClient): void {
  if (
    typeof client.erpModule?.findMany === "function" &&
    typeof client.pricingPlan?.findMany === "function" &&
    typeof client.subscription?.findMany === "function"
  ) {
    return;
  }

  throw new Error(
    [
      "Prisma Client is out of date (missing pricingPlan or other models).",
      "Run: npx prisma generate",
      "Then: rm -rf .next && npm run dev",
    ].join(" "),
  );
}

export function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    globalForPrisma.prismaClientVersion === PRISMA_CLIENT_VERSION
  ) {
    assertClientHasAllModels(cached);
    return cached;
  }

  if (cached) {
    void cached.$disconnect();
  }

  const client = createPrismaClient();
  assertClientHasAllModels(client);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaClientVersion = PRISMA_CLIENT_VERSION;
  }

  return client;
}

/** Resolves the current client on each property access (safe with Turbopack HMR). */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
