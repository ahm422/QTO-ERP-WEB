import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../src/db/schema";
import { withScriptDb } from "./db";
import { seedContent } from "./seed-content";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment to seed the admin user.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await withScriptDb(async (db) => {
    await db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: "ADMIN",
        name: "Admin",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          passwordHash,
          role: "ADMIN",
        },
      });

    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!admin) {
      throw new Error("Failed to seed admin user");
    }

    console.log(`Seeded admin user: ${email}`);
    await seedContent(db, admin.id);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
