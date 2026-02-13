import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Keycloak from 'keycloak-js';

interface AuthContextType {
  keycloak: Keycloak | null;
  authenticated: boolean;
  token: string | null;
  userName: string | null;
  login: () => void;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  keycloak: null,
  authenticated: false,
  token: null,
  userName: null,
  login: () => {},
  logout: () => {},
  isInitialized: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keycloak] = useState(
    () =>
      new Keycloak({
        url: import.meta.env.VITE_ADMIN_KEYCLOAK_URL || 'http://localhost:8080',
        realm: import.meta.env.VITE_ADMIN_KEYCLOAK_REALM || 'kosmetika',
        clientId: import.meta.env.VITE_ADMIN_KEYCLOAK_CLIENT_ID || 'kosmetika-admin',
      }),
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    keycloak
      .init({ onLoad: 'login-required' })
      .then((auth) => {
        setAuthenticated(auth);
        setToken(keycloak.token || null);
        if (auth && keycloak.tokenParsed) {
          setUserName(
            `${keycloak.tokenParsed.given_name || ''} ${keycloak.tokenParsed.family_name || ''}`.trim(),
          );
        }
        setIsInitialized(true);

        // Token refresh
        setInterval(() => {
          keycloak.updateToken(30).catch(() => keycloak.logout());
        }, 60000);
      })
      .catch(() => {
        setIsInitialized(true);
      });
  }, [keycloak]);

  const login = useCallback(() => keycloak.login(), [keycloak]);
  const logout = useCallback(() => keycloak.logout(), [keycloak]);

  return (
    <AuthContext.Provider
      value={{ keycloak, authenticated, token, userName, login, logout, isInitialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};
