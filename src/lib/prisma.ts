import { PrismaClient } from "../../generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

let prisma: PrismaClient;

export async function getPrisma(): Promise<PrismaClient> {
  if (prisma) return prisma;
  console.log('Initializing Prisma client');
  // 1. Try to get the D1 binding from the global scope (Cloudflare/Nitro)
  // Nitro shims 'process.env' for Cloudflare, but we check globalThis as well
  const global = (globalThis as any);
  const db = global.__env__?.DB;
  if (db) {
    console.log('Found D1 binding in global.__env__.DB');
    const adapter = new PrismaD1(db);
    prisma = new PrismaClient({ adapter });
    console.log('Prisma client initialized with D1 adapter');
    return prisma;
  }
  console.log('No D1 binding found, falling back to local development');

  // 2. Fallback for local Node/Docker development
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  prisma = new PrismaClient({ adapter });
  console.log('Prisma client initialized with BetterSqlite3 adapter');
  return prisma;
}

// Export singleton (populated after first getPrisma() call)
export { prisma };