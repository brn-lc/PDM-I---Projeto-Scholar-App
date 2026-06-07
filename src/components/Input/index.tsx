import React from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";
import { colors } from "../../theme/colors";

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string; // Nova propriedade para erro
}

export function AppInput({ label, error, style, ...rest }: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null, // Muda a borda se houver erro
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
      {/* Exibe a mensagem de erro se existir */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: "#FEF2F2", // Fundo levemente vermelho
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
