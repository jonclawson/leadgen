import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "../../lib/prisma";

let authInstance: ReturnType<typeof betterAuth> | undefined;

/**
 * Get better-auth instance.
 * Lazily initializes with the Prisma client after it's ready.
 */
export async function getAuth() {
  if (authInstance) return authInstance;

  const prisma = await getPrisma();
  
  authInstance = betterAuth({
    database: prismaAdapter(prisma, { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
  });

  return authInstance;
}
