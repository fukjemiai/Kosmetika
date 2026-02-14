import Keycloak from "keycloak-js";

function mustGet(name: string): string {
  const v = (import.meta.env as any)[name] as string | undefined;
  if (!v) throw new Error(`${name} is missing`);
  return v;
}

const keycloakConfig = {
  url: mustGet("VITE_ADMIN_KEYCLOAK_URL"),
  realm: mustGet("VITE_ADMIN_KEYCLOAK_REALM"),
  clientId: mustGet("VITE_ADMIN_KEYCLOAK_CLIENT_ID"),
};

// HMR/StrictMode-safe: držíme instanci i init promise globálně
declare global {
  interface Window {
    __adminKc?: Keycloak;
    __adminKcInit?: Promise<boolean>;
  }
}

export const keycloak = window.__adminKc ?? (window.__adminKc = new Keycloak(keycloakConfig));

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
