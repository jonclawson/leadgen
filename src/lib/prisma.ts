import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";

let prisma: PrismaClient;

/**
 * Get Prisma client instance.
 * Automatically detects runtime environment:
 * - Cloudflare Workers: Uses D1 adapter via 'cloudflare:workers' import
 * - Node/Docker: Uses better-sqlite3 adapter
 */
export async function getPrisma(): Promise<PrismaClient> {
  if (prisma) return prisma;

  // Check if we are running inside Cloudflare using the global env import
  try {
    const { env } = await import("cloudflare:workers");

    // If the binding exists, we are on Cloudflare Pages/Workers
    if (env && (env as any).DB) {
      const { PrismaD1 } = await import("@prisma/adapter-d1");
      const adapter = new PrismaD1((env as any).DB);

      prisma = new PrismaClient({ adapter });
      return prisma;
    }
  } catch (e) {
    // 'cloudflare:workers' module isn't available -> we are running locally in Node/Docker
  }

  // Fallback to Node/Docker with better-sqlite3 adapter
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  prisma = new PrismaClient({ adapter });
  return prisma;
}

// Export singleton (populated after first getPrisma() call)
export { prisma };