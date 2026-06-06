import api from "./api";
import { Disciplina, Aluno } from "../navigation/types";

// Tipo que estende a Disciplina padrão para incluir o array de Alunos devolvido na rota de detalhes
export type DisciplinaDetalhes = Disciplina & { alunos: Aluno[] };

export const disciplinaService = {
  getAll: async (): Promise<Disciplina[]> => {
    const response = await api.get("/api/disciplinas");
    return response.data;
  },

  getById: async (id: number): Promise<DisciplinaDetalhes> => {
    const response = await api.get(`/api/disciplinas/${id}/detalhes`);
    return response.data;
  },

  create: async (
    data: Omit<Disciplina, "id" | "professor">,
  ): Promise<Disciplina> => {
    const response = await api.post("/api/disciplinas", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<Disciplina>,
  ): Promise<Disciplina> => {
    const response = await api.put(`/api/disciplinas/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/disciplinas/${id}`);
    return response.data;
  },

  atribuirProfessor: async (
    disciplinaId: number,
    professorId: number,
  ): Promise<void> => {
    const response = await api.put(
      `/api/disciplinas/${disciplinaId}/professor`,
      { professorId },
    );
    return response.data;
  },

  matricularAluno: async (
    disciplinaId: number,
    alunoId: number,
  ): Promise<void> => {
    const response = await api.post(`/api/disciplinas/${disciplinaId}/alunos`, {
      alunoId,
    });
    return response.data;
  },

  removerAluno: async (
    disciplinaId: number,
    alunoId: number,
  ): Promise<void> => {
    const response = await api.delete(
      `/api/disciplinas/${disciplinaId}/alunos/${alunoId}`,
    );
    return response.data;
  },
};
