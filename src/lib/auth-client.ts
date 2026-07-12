import { createAuthClient } from "better-auth/client";

try {
        const { env } = await import("cloudflare:workers");

}

export const authClient = createAuthClient({
    baseURL: import.meta.env['VITE_AUTH_URL'] || "http://localhost:5173"
});