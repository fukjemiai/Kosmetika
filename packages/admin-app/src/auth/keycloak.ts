import Keycloak from "keycloak-js";

function mustEnv(name: string): string {
  const v = (import.meta.env as any)[name] as string | undefined;
  if (!v) throw new Error(`${name} is missing`);
  return v;
}

const config = {
  url: mustEnv("VITE_ADMIN_KEYCLOAK_URL"),
  realm: mustEnv("VITE_ADMIN_KEYCLOAK_REALM"),
  clientId: mustEnv("VITE_ADMIN_KEYCLOAK_CLIENT_ID"),
};

declare global {
  interface Window {
    __adminKc?: Keycloak;
    __adminKcInit?: Promise<boolean>;
  }
}

export const keycloak =
  window.__adminKc ?? (window.__adminKc = new Keycloak(config));

export function initKeycloak(): Promise<boolean> {
  if (!window.__adminKcInit) {
    window.__adminKcInit = keycloak.init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false,
    });
  }
  return window.__adminKcInit;
}

/**
 * Vrátí validní access token (a předtím se ho pokusí refreshnout).
 * Když uživatel není přihlášený, hodí error.
 */
export async function getAccessToken(minValiditySeconds = 30): Promise<string> {
  await initKeycloak();

  if (!keycloak.authenticated) {
    throw new Error("Not authenticated");
  }

  // Refresh (Keycloak sám vyhodnotí, zda je třeba)
  try {
    await keycloak.updateToken(minValiditySeconds);
  } catch {
    // když refresh selže, necháme rozhodnout server / následný 401 handling
  }

  const token = keycloak.token;
  if (!token) throw new Error("Access token missing");

  return token;
}
