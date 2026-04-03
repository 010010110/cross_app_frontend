import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { JwtUser } from "@/types/auth";

const TOKEN_KEY = "auth_token";
const BOX_ID_KEY = "selected_box_id";

interface AuthContextValue {
  token: string | null;
  user: JwtUser | null;
  selectedBoxId: string | null;
  login: (token: string, user: JwtUser) => void;
  logout: () => void;
  setSelectedBoxId: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<JwtUser | null>(() => {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as JwtUser) : null;
  });
  const [selectedBoxId, setSelectedBoxIdState] = useState<string | null>(
    () => localStorage.getItem(BOX_ID_KEY)
  );

  // Auto-seleciona o primeiro box quando o token é definido mas não há box selecionado
  useEffect(() => {
    if (user && !selectedBoxId && user.boxIds.length > 0) {
      const firstBoxId = user.boxIds[0];
      localStorage.setItem(BOX_ID_KEY, firstBoxId);
      setSelectedBoxIdState(firstBoxId);
    }
  }, [user, selectedBoxId]);

  const login = useCallback((newToken: string, newUser: JwtUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    const boxId = newUser.boxIds[0] ?? null;
    if (boxId) localStorage.setItem(BOX_ID_KEY, boxId);
    setToken(newToken);
    setUser(newUser);
    setSelectedBoxIdState(boxId);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("auth_user");
    localStorage.removeItem(BOX_ID_KEY);
    setToken(null);
    setUser(null);
    setSelectedBoxIdState(null);
  }, []);

  const setSelectedBoxId = useCallback((id: string) => {
    localStorage.setItem(BOX_ID_KEY, id);
    setSelectedBoxIdState(id);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, selectedBoxId, login, logout, setSelectedBoxId }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
