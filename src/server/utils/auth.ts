import { betterAuth } from "better-auth";
import { getPrisma } from "../../lib/prisma";

let authInstance: ReturnType<typeof betterAuth> | undefined;

/**
 * Get better-auth instance.
 * Lazily imports the Prisma adapter to prevent top-level 
 * compilation crashes on the Cloudflare edge runtime.
 */
export async function getAuth() {
  if (authInstance) return authInstance;

  // 1. Await your smart prisma client instance
  const prismaClient = await getPrisma();
  
  // 2. Dynamically load the Prisma adapter so it doesn't crash during the Vite/Nitro compilation phase
  const { prismaAdapter } = await import("better-auth/adapters/prisma");

  authInstance = betterAuth({
    database: prismaAdapter(prismaClient, { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
  });

  return authInstance;
}

// import { betterAuth } from "better-auth";
// import { kyselyAdapter } from "better-auth/adapters/kysely";
// import { Kysely } from "keysley"; // requires installing 'kysely'
// import { D1Dialect } from "kysely-d1"; // requires installing 'kysely-d1'

// let authInstance: ReturnType<typeof betterAuth> | undefined;

// export async function getAuth() {
//   if (authInstance) return authInstance;

//   let isCloudflare = false;
//   let cloudflareDb: any = null;
  
//   try {
//     const { env } = await import("cloudflare:workers");
//     if (env && (env as any).DB) {
//       isCloudflare = true;
//       cloudflareDb = (env as any).DB;
//     }
//   } catch (e) {}

//   let databaseConfig;

//   if (isCloudflare) {
//     // 🚀 Instantiating Kysely specifically with Cloudflare's D1 Dialect
//     const db = new Kysely({
//       dialect: new D1Dialect({
//         database: cloudflareDb,
//       }),
//     });

//     databaseConfig = kyselyAdapter(db, { type: "sqlite" });
//   } else {
//     // Fall back to your Prisma/Local Dev config path
//     const { prismaAdapter } = await import("better-auth/adapters/prisma");
//     const { getPrisma } = await import("../../lib/prisma");
//     const prisma = await getPrisma();
//     databaseConfig = prismaAdapter(prisma, { provider: "sqlite" });
//   }

//   authInstance = betterAuth({
//     database: databaseConfig,
//     emailAndPassword: { enabled: true },
//   });

//   return authInstance;
// }