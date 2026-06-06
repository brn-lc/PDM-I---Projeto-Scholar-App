import { Alert, Platform } from "react-native";

export const AlertHelper = {
  show: (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  },
  confirm: (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) onConfirm();
    } else {
      Alert.alert(title, message, [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: onConfirm, style: "destructive" },
      ]);
    }
  },
};
