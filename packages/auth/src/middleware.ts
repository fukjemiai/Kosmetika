import type { NextRequest } from "next/server";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    sub: string;
    email?: string;
    name?: string;
    roles?: string[];
  };
}

/**
 * Validate a JWT token from Authorization header.
 * For NestJS API, use the NestJS guard instead.
 * This is a simplified check for Next.js middleware.
 */
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (req: AuthenticatedRequest) => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Token validation should be done by Keycloak introspection or JWT verification
    // This is a placeholder - real validation happens in the API backend
    return handler(req);
  };
}
