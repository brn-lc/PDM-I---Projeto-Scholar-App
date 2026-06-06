import axios from "axios";

export interface IBGEUF {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGECidade {
  id: number;
  nome: string;
}

export const externalService = {
  getEstadosIBGE: async (): Promise<IBGEUF[]> => {
    try {
      const res = await axios.get(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
      );
      return res.data.sort((a: IBGEUF, b: IBGEUF) =>
        a.nome.localeCompare(b.nome),
      );
    } catch (error) {
      console.error("Erro ao buscar estados do IBGE", error);
      throw error;
    }
  },
  getCidadesPorUF: async (ufSigla: string): Promise<IBGECidade[]> => {
    try {
      const res = await axios.get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSigla}/municipios`,
      );
      return res.data
        .map((cidade: any) => ({
          id: cidade.id,
          nome: cidade.nome,
        }))
        .sort((a: IBGECidade, b: IBGECidade) => a.nome.localeCompare(b.nome));
    } catch (error) {
      console.error("Erro ao buscar cidades do IBGE", error);
      throw error;
    }
  },
  getEnderecoPorCEP: async (cep: string) => {
    const cepNumeros = cep.replace(/\D/g, "");
    if (cepNumeros.length !== 8) throw new Error("CEP inválido");

    try {
      const res = await axios.get(
        `https://viacep.com.br/ws/${cepNumeros}/json/`,
      );
      if (res.data.erro) throw new Error("CEP não encontrado");
      return {
        endereco: res.data.logradouro,
        cidade: res.data.localidade,
        estado: res.data.uf,
      };
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
      throw error;
    }
  },
};
