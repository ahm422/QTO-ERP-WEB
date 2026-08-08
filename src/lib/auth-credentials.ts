import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getDb } from "@/lib/db";

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<{ id: string; email: string; name: string | null; role: string } | null> {
  const [user] = await (await getDb())
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
