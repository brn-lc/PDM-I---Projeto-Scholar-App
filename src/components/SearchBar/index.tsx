import React from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

// Estendemos as props nativas do TextInput para suportar onSubmitEditing
interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Buscar...",
  ...rest // Recebe o resto das propriedades (ex: onSubmitEditing)
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Feather
        name="search"
        size={18}
        color={colors.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  icon: { marginRight: spacing.sm },
  input: { flex: 1, fontSize: typography.size.sm, color: colors.text },
});
