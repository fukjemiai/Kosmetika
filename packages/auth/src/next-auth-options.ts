import type { AuthOptions } from "next-auth";

/**
 * NextAuth options for Keycloak provider.
 * Usage in apps: `export const authOptions = createAuthOptions({ clientId, clientSecret })`.
 */
export const authOptions: AuthOptions = {
  providers: [
    {
      id: "keycloak",
      name: "Keycloak",
      type: "oauth",
      wellKnown: `${process.env.KEYCLOAK_URL ?? "http://localhost:8080"}/realms/${process.env.KEYCLOAK_REALM ?? "kosmetika"}/.well-known/openid-configuration`,
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "kosmetika-web",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "openid email profile" } },
      idToken: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        error: token.error as string | undefined,
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
