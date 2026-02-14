import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { keycloak, initKeycloak } from "./keycloak";

type AuthCtx = {
  ready: boolean;
  authenticated: boolean;
  keycloak: typeof keycloak;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    initKeycloak()
      .then((auth) => {
        if (cancelled) return;
        setAuthenticated(auth);
        setReady(true);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("Keycloak init failed:", e);
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      ready,
      authenticated,
      keycloak,
      login: () => keycloak.login(),
      logout: () => keycloak.logout(),
    }),
    [ready, authenticated]
  );

  if (!ready) return null; // nebo loader

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
