import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/Header";
import { AppInput } from "../components/Input";
import { AppButton } from "../components/Button";
import { AppSelect } from "../components/Select";
import { professorService } from "../services/professor.service";
import { AlertHelper } from "../utils/AlertHelper";
import { RootStackParamList } from "../navigation/types";

type CadastroProfessorNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "CadastroProfessor"
>;
type CadastroProfessorRouteProp = RouteProp<
  RootStackParamList,
  "CadastroProfessor"
>;

export default function CadastroProfessorScreen() {
  const navigation = useNavigation<CadastroProfessorNavProp>();
  const route = useRoute<CadastroProfessorRouteProp>();

  const { professorEdit } = route.params || {};
  const isEditing = !!professorEdit;

  const [form, setForm] = useState({
    nome: professorEdit?.nome || "",
    titulacao: professorEdit?.titulacao || "",
    area_atuacao: professorEdit?.area || "",
    tempo_docencia: professorEdit?.tempo_docencia || "",
    email: professorEdit?.email || "",
  });

  const [loading, setLoading] = useState(false);

  // Estados de erro visual
  const [nomeError, setNomeError] = useState("");
  const [emailError, setEmailError] = useState("");

  const opcoesTitulacao = [
    "Graduado",
    "Especialista",
    "Mestre",
    "Doutor",
    "Pós-Doutor",
  ];

  const handleSave = async () => {
    // Resetar erros
    setNomeError("");
    setEmailError("");
    let hasError = false;

    // Validação inline
    if (!form.nome.trim()) {
      setNomeError("O nome do professor é obrigatório.");
      hasError = true;
    }
    if (!form.email.trim()) {
      setEmailError("O e-mail é obrigatório.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      if (isEditing && professorEdit) {
        await professorService.update(professorEdit.id, form);
        AlertHelper.show("Sucesso", "Professor atualizado com sucesso!");
      } else {
        await professorService.create(form);
        AlertHelper.show("Sucesso", "Professor cadastrado com sucesso!");
      }
      navigation.goBack();
    } catch (error) {
      AlertHelper.show("Erro", "Falha ao salvar professor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withKeyboard>
      <Header
        title={isEditing ? "Editar Professor" : "Novo Professor"}
        showBack
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppInput
          label="Nome *"
          placeholder="Nome completo"
          value={form.nome}
          onChangeText={(txt) => {
            setForm({ ...form, nome: txt });
            if (nomeError) setNomeError("");
          }}
          error={nomeError}
        />

        <AppInput
          label="E-mail *"
          placeholder="professor@email.com"
          value={form.email}
          onChangeText={(txt) => {
            setForm({ ...form, email: txt });
            if (emailError) setEmailError("");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError}
        />

        <AppSelect
          label="Titulação"
          options={opcoesTitulacao}
          value={form.titulacao}
          onSelect={(val) => setForm({ ...form, titulacao: val })}
        />

        <AppInput
          label="Área de Atuação"
          placeholder="Ex: Engenharia de Software"
          value={form.area_atuacao}
          onChangeText={(txt) => setForm({ ...form, area_atuacao: txt })}
        />

        <AppInput
          label="Tempo de Docência"
          placeholder="Ex: 5 anos"
          value={form.tempo_docencia}
          onChangeText={(txt) => setForm({ ...form, tempo_docencia: txt })}
        />

        <AppButton
          title={isEditing ? "Salvar Alterações" : "Salvar Professor"}
          onPress={handleSave}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  submitBtn: {
    marginTop: spacing.lg,
  },
});
