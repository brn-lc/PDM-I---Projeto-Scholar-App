import api from "./api";

// Interface rigorosa para o payload de atualização de notas
export interface NotaAtualizacao {
  id: string | number;
  nota1: string | number | null;
  nota2: string | number | null;
  media: string | number | null;
  situacao: string;
}

export const boletimService = {
  getBoletimAluno: async (matricula: string) => {
    const response = await api.get(`/api/boletim/${matricula}`);
    return response.data;
  },

  getGestaoNotas: async () => {
    const response = await api.get(`/api/gestao-notas`);
    return response.data;
  },

  updateNotas: async (notas: NotaAtualizacao[]): Promise<void> => {
    const response = await api.put(`/api/gestao-notas`, { notas });
    return response.data;
  },
};
