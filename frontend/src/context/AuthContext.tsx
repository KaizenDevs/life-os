// Holds the current user's token and exposes signIn / signOut
// Token lives in sessionStorage — survives page reload, cleared on browser close

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface CurrentUser {
  email: string;
  system_role: string;
}

interface AuthContextType {
  token: string | null;
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

function decodeToken(token: string): CurrentUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { email: payload.email, system_role: payload.system_role };
  } catch {
    return null;
  }
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("token")
  );

  function signIn(newToken: string) {
    sessionStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function signOut() {
    sessionStorage.removeItem("token");
    setToken(null);
  }

  useEffect(() => {
    const handler = () => signOut();
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, currentUser: token ? decodeToken(token) : null, isAuthenticated: !!token, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
