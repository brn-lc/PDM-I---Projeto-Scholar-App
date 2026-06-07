import api from "./api";
import { Aluno } from "../navigation/types"; // Importando a tipagem

export const alunoService = {
  getAll: async (): Promise<Aluno[]> => {
    const response = await api.get("/api/alunos");
    return response.data;
  },
  create: async (data: Omit<Aluno, "id">): Promise<Aluno> => {
    const response = await api.post("/api/alunos", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Aluno>): Promise<Aluno> => {
    const response = await api.put(`/api/alunos/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/alunos/${id}`);
    return response.data;
  },
  getMeuPerfil: async (email: string) => {
    const response = await api.get(`/api/alunos/perfil/${email}`);
    return response.data;
  },
  updateMeuPerfil: async (emailAtual: string, data: any) => {
    const response = await api.put(`/api/alunos/perfil/${emailAtual}`, data);
    return response.data;
  },
};
