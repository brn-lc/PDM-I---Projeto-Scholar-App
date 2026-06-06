import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

interface EmptyStateProps {
  iconName: React.ComponentProps<typeof Feather>["name"];
  message: string;
}

export function EmptyState({ iconName, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Feather name={iconName} size={48} color={colors.border} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    marginTop: spacing.xl,
  },
  text: {
    textAlign: "center",
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
});
