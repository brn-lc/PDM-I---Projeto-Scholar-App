import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { AppInput } from "../components/Input";
import { AppButton } from "../components/Button";
import { ScreenContainer } from "../components/ScreenContainer";
import { authService } from "../services/auth.service";
import { AlertHelper } from "../utils/AlertHelper";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados de erro
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { signIn } = useAuth();

  const handleLogin = async () => {
    // Resetar erros
    setEmailError("");
    setPasswordError("");
    let hasError = false;

    // Validação inline rigorosa
    if (!email) {
      setEmailError("O e-mail é obrigatório.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("A senha é obrigatória.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const data = await authService.login(email, password);
      await signIn(data.token, data.user);
    } catch (error: any) {
      const msg = error.response?.data?.error || "Credenciais inválidas.";
      AlertHelper.show("Erro de Autenticação", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Utilizamos o withKeyboard do ScreenContainer para limpar o código
    <ScreenContainer withKeyboard>
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Faça login na sua conta Scholar</Text>

        <View style={styles.formContainer}>
          <AppInput
            label="E-mail"
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />

          <AppInput
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError("");
            }}
            secureTextEntry
            error={passwordError}
          />

          <AppButton
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  loginBtn: {
    marginTop: spacing.md,
  },
});
