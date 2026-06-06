import api from "./api";
import { Professor } from "../navigation/types";

export const professorService = {
  // Retorna um array de Professores
  getAll: async (): Promise<Professor[]> => {
    const response = await api.get("/api/professores");
    return response.data;
  },

  // Omitimos o "id" no momento da criação, pois o banco de dados (PostgreSQL) irá gerá-lo
  create: async (data: Omit<Professor, "id">): Promise<Professor> => {
    const response = await api.post("/api/professores", data);
    return response.data;
  },

  // Tipagem rigorosa do ID
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/professores/${id}`);
    return response.data;
  },

  // Partial<Professor> permite enviar apenas os campos que foram alterados na edição
  update: async (id: number, data: Partial<Professor>): Promise<Professor> => {
    const response = await api.put(`/api/professores/${id}`, data);
    return response.data;
  },
};
