import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Serviço de armazenamento seguro.
 * Utiliza SecureStore (encriptado) em dispositivos móveis.
 * Utiliza localStorage como fallback no navegador Web.
 */
export const storageService = {
  async save(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async remove(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};
