import api from "./api";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/api/login", { email, password });
    return response.data;
  },
};
