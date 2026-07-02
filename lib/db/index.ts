import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error("Missing Turso database credentials in environment variables");
}

// Workaround for Node.js undici fetch ETIMEDOUT issue (Happy Eyeballs IPv6 bug)
if (typeof process !== "undefined" && process.release?.name === "node") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require("node:dns");
    if (dns && typeof dns.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch {
    // Ignore error in edge runtimes
  }
}

const createDb = () => {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  return drizzle(client, { schema });
};

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb> | undefined;
};

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
