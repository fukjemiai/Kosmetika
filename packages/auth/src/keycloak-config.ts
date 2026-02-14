export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

export function keycloakConfig(overrides?: Partial<KeycloakConfig>): KeycloakConfig {
  return {
    url: overrides?.url ?? process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8080",
    realm: overrides?.realm ?? process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "kosmetika",
    clientId: overrides?.clientId ?? process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "kosmetika-web",
  };
}
