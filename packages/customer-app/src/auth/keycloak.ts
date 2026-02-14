import Keycloak from "keycloak-js";

const config = {
  url: import.meta.env.VITE_KEYCLOAK_URL,        // např. http://localhost:8080
  realm: import.meta.env.VITE_KEYCLOAK_REALM,    // např. kosmetika
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID, // např. frontend-app
};

// DEV/HMR-safe: držet instanci i init promise na window
declare global {
  interface Window {
    __kc?: Keycloak;
    __kcInit?: Promise<boolean>;
  }
}

export const keycloak = window.__kc ?? (window.__kc = new Keycloak(config));

export function initKeycloak(): Promise<boolean> {
  if (!window.__kcInit) {
    window.__kcInit = keycloak.init({
      onLoad: "check-sso",     // nebo "login-required"
      pkceMethod: "S256",
      checkLoginIframe: false, // dev-friendly
    });
  }
  return window.__kcInit;
}
export async function getOptionalAccessToken(minValiditySeconds = 30): Promise<string | null> {
  try {
    await initKeycloak();
    if (!keycloak.authenticated) return null;

    try {
      await keycloak.updateToken(minValiditySeconds);
    } catch {
      // ignore
    }

    return keycloak.token ?? null;
  } catch {
    return null;
  }
}
