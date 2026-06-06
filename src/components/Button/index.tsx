import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  Platform,
} from "react-native";
import { colors } from "../../theme/colors";

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export function AppButton({
  title,
  loading,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.disabled, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 4,
    ...Platform.select({
      web: {
        // Padrão Web (offsetX offsetY blur rgba)
        boxShadow: "0px 4px 8px rgba(37, 99, 235, 0.3)",
      },
      default: {
        // Padrão iOS/Native
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },
});
