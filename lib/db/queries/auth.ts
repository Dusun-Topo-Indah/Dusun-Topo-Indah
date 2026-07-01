import { db } from "../index";
import { adminAuth } from "../schema";
import { eq } from "drizzle-orm";

export async function getAdminByUsername(username: string) {
  const result = await db.select().from(adminAuth).where(eq(adminAuth.username, username));
  return result[0];
}

export async function updateAdminCredentials(currentUsername: string, newUsername: string, hashedPassword: string) {
  const result = await db.update(adminAuth).set({
    username: newUsername,
    password: hashedPassword,
  }).where(eq(adminAuth.username, currentUsername));
  return result.rowsAffected > 0;
}
