import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initKeycloak, keycloak } from "./keycloak";

type AuthContextType = {
  authenticated: boolean;
  isInitialized: boolean;
  token: string | null;
  userName: string | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let refreshTimer: number | undefined;

    initKeycloak()
      .then((auth) => {
        setAuthenticated(auth);
        setToken(keycloak.token ?? null);

        if (auth && keycloak.tokenParsed) {
          const given = (keycloak.tokenParsed as any).given_name ?? "";
          const family = (keycloak.tokenParsed as any).family_name ?? "";
          const full = `${given} ${family}`.trim();
          setUserName(full || null);
        } else {
          setUserName(null);
        }

        setIsInitialized(true);

        // token refresh (cleanable)
        refreshTimer = window.setInterval(() => {
          keycloak
            .updateToken(30)
            .then(() => setToken(keycloak.token ?? null))
            .catch(() => keycloak.logout());
        }, 60_000);
      })
      .catch((e) => {
        console.error("Keycloak init failed:", e);
        setIsInitialized(true);
      });

    return () => {
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, []);

  const login = useCallback(() => keycloak.login(), []);
  const logout = useCallback(() => keycloak.logout(), []);

  const value = useMemo<AuthContextType>(
    () => ({ authenticated, isInitialized, token, userName, login, logout }),
    [authenticated, isInitialized, token, userName, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
