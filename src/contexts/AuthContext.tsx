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
  addUserBox: (id: string) => void;
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

  // Mantém o box selecionado consistente com os boxes disponíveis no usuário.
  useEffect(() => {
    if (!user) return;

    const hasSelected = selectedBoxId && user.boxIds.includes(selectedBoxId);
    if (hasSelected) return;

    if (user.boxIds.length > 0) {
      const firstBoxId = user.boxIds[0];
      localStorage.setItem(BOX_ID_KEY, firstBoxId);
      setSelectedBoxIdState(firstBoxId);
      return;
    }

    localStorage.removeItem(BOX_ID_KEY);
    setSelectedBoxIdState(null);
  }, [user, selectedBoxId]);

  const login = useCallback((newToken: string, newUser: JwtUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    const boxId = newUser.boxIds[0] ?? null;
    if (boxId) {
      localStorage.setItem(BOX_ID_KEY, boxId);
    } else {
      localStorage.removeItem(BOX_ID_KEY);
    }
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
    // Admin can manage boxes that may not all be present in JWT boxIds.
    if (user && user.role !== "ADMIN" && user.boxIds.length > 0 && !user.boxIds.includes(id)) return;
    localStorage.setItem(BOX_ID_KEY, id);
    setSelectedBoxIdState(id);
  }, [user]);

  const addUserBox = useCallback((id: string) => {
    setUser((current) => {
      if (!current || current.boxIds.includes(id)) return current;

      const nextUser = { ...current, boxIds: [...current.boxIds, id] };
      localStorage.setItem("auth_user", JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, selectedBoxId, login, logout, setSelectedBoxId, addUserBox }}
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
