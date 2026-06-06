import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import api from "../services/api";
import { storageService } from "../services/storage"; // <-- Importa o novo serviço

interface User {
  id: number;
  email: string;
  nome: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Chaves limpas sem caracteres especiais (exigência do SecureStore)
  const TOKEN_KEY = "scholar_token";
  const USER_KEY = "scholar_user";

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await storageService.get(TOKEN_KEY);
        const storedUser = await storageService.get(USER_KEY);

        if (storedToken && storedUser) {
          api.defaults.headers.common["Authorization"] =
            `Bearer ${storedToken}`;
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do Storage:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(token: string, loggedUser: User) {
    try {
      // Guarda os dados de forma segura
      await storageService.save(TOKEN_KEY, token);
      await storageService.save(USER_KEY, JSON.stringify(loggedUser));

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(loggedUser);
    } catch (error) {
      console.error("Erro ao guardar o utilizador no Storage Seguro:", error);
    }
  }

  async function signOut() {
    try {
      // Remove APENAS as chaves de sessão (boa prática), em vez de apagar tudo
      await storageService.remove(TOKEN_KEY);
      await storageService.remove(USER_KEY);

      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }
  return context;
}
