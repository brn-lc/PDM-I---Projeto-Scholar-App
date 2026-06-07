import axios from "axios";
import { storageService } from "./storage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se o backend retornar 401 (token expirado ou inválido)
    if (error.response?.status === 401) {
      console.log("[API] Sessão expirada ou não autorizada.");
      // Limpa os dados armazenados (fallback preventivo)
      await storageService.remove("scholar_token");
      await storageService.remove("scholar_user");
      // Importante: No seu App.tsx ou AuthContext, escute essa falha ou recarregue a UI.
    }
    return Promise.reject(error);
  },
);

export default api;
