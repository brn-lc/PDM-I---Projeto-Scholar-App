import { useState, useCallback } from "react";
import { AlertHelper } from "../utils/AlertHelper";

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (apiCall: () => Promise<T>) => {
    setLoading(true);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (error: any) {
      const msgErro =
        error.response?.data?.error || "Ocorreu um erro inesperado.";
      AlertHelper.show("Erro", msgErro);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, request, setData };
}
