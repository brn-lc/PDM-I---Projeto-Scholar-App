import React from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  withKeyboard?: boolean; // Adicionado para gerir o teclado globalmente
}

export function ScreenContainer({
  children,
  style,
  noPadding = false,
  withKeyboard = false,
}: ScreenContainerProps) {
  const content = (
    <View style={[styles.container, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {withKeyboard ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  padding: { paddingHorizontal: spacing.screenPadding },
});
