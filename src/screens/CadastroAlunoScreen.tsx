import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/Header";
import { AppInput } from "../components/Input";
import { AppButton } from "../components/Button";
import { AppSelect } from "../components/Select";
import { alunoService } from "../services/aluno.service";
import { externalService } from "../services/external.service"; // <-- Serviço Centralizado
import { AlertHelper } from "../utils/AlertHelper";
import { AppNavigationProp, RootStackParamList } from "../navigation/types";

type CadastroAlunoNavProp = AppNavigationProp<"CadastroAluno">;
type CadastroAlunoRouteProp = RouteProp<RootStackParamList, "CadastroAluno">;

export default function CadastroAlunoScreen() {
  const navigation = useNavigation<CadastroAlunoNavProp>();
  const route = useRoute<CadastroAlunoRouteProp>();

  const { alunoEdit } = route.params || {};
  const isEditing = !!alunoEdit;

  const [loading, setLoading] = useState(false);

  // Otimização: Apenas lidamos com as strings finais na UI
  const [estados, setEstados] = useState<string[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);

  // Feedback Visual e Validação (Requisito da Parte 1)
  const [nomeError, setNomeError] = useState("");
  const [matriculaError, setMatriculaError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [form, setForm] = useState({
    nome: alunoEdit?.nome || "",
    matricula: alunoEdit?.matricula || "",
    curso: alunoEdit?.curso || "",
    email: alunoEdit?.email || "",
    telefone: alunoEdit?.telefone || "",
    cep: alunoEdit?.cep || "",
    endereco: alunoEdit?.endereco || "",
    cidade: alunoEdit?.cidade || "",
    estado: alunoEdit?.estado || "",
  });

  useEffect(() => {
    carregarEstadosIBGE();
    if (alunoEdit?.estado) {
      carregarCidadesIBGE(alunoEdit.estado);
    }
  }, []);

  const carregarEstadosIBGE = async () => {
    try {
      const data = await externalService.getEstadosIBGE();
      setEstados(data.map((uf) => uf.sigla));
    } catch (error) {
      AlertHelper.show("Erro", "Falha ao comunicar com a API do IBGE.");
    }
  };

  const carregarCidadesIBGE = async (siglaUF: string) => {
    try {
      const data = await externalService.getCidadesPorUF(siglaUF);
      setCidades(data.map((cidade) => cidade.nome));
    } catch (error) {
      AlertHelper.show("Erro", "Não foi possível carregar as cidades.");
    }
  };

  const handleEstadoChange = (uf: string) => {
    setForm((prev) => ({ ...prev, estado: uf, cidade: "" }));
    carregarCidadesIBGE(uf);
  };

  const processarCep = async (cepText: string) => {
    const cepLimpo = cepText.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, cep: cepLimpo }));

    if (cepLimpo.length === 8) {
      try {
        const dadosEndereco = await externalService.getEnderecoPorCEP(cepLimpo);

        setForm((prev) => ({
          ...prev,
          endereco: dadosEndereco.endereco,
          estado: dadosEndereco.estado,
          cidade: dadosEndereco.cidade,
        }));

        carregarCidadesIBGE(dadosEndereco.estado);
      } catch (error) {
        AlertHelper.show(
          "Aviso",
          "O CEP introduzido é inválido ou não foi encontrado.",
        );
      }
    }
  };

  const handleSave = async () => {
    setNomeError("");
    setMatriculaError("");
    setEmailError("");

    let hasError = false;

    // Cumprimento do requisito de validação obrigatória
    if (!form.nome.trim()) {
      setNomeError("O nome do aluno é obrigatório.");
      hasError = true;
    }
    if (!form.matricula.trim()) {
      setMatriculaError("A matrícula é obrigatória.");
      hasError = true;
    }
    if (!form.email.trim()) {
      setEmailError("O e-mail é obrigatório.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      if (isEditing && alunoEdit) {
        await alunoService.update(alunoEdit.id, form);
        AlertHelper.show("Sucesso", "Aluno atualizado com sucesso!");
      } else {
        await alunoService.create(form);
        AlertHelper.show("Sucesso", "Aluno cadastrado com sucesso!");
      }
      navigation.goBack();
    } catch (error) {
      AlertHelper.show(
        "Erro",
        "Falha ao gravar os dados do aluno no servidor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title={isEditing ? "Editar Aluno" : "Novo Aluno"} showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>Dados Académicos e Pessoais</Text>

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
            label="Matrícula *"
            placeholder="Ex: 123456"
            value={form.matricula}
            onChangeText={(txt) => {
              setForm({ ...form, matricula: txt });
              if (matriculaError) setMatriculaError("");
            }}
            keyboardType="numeric"
            error={matriculaError}
          />
          <AppInput
            label="Curso"
            placeholder="Ex: Análise de Sistemas"
            value={form.curso}
            onChangeText={(txt) => setForm({ ...form, curso: txt })}
          />
          <AppInput
            label="E-mail *"
            placeholder="aluno@email.com"
            value={form.email}
            onChangeText={(txt) => {
              setForm({ ...form, email: txt });
              if (emailError) setEmailError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />
          <AppInput
            label="Telefone"
            placeholder="(00) 00000-0000"
            value={form.telefone}
            onChangeText={(txt) => setForm({ ...form, telefone: txt })}
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionTitle}>Endereço (ViaCEP & IBGE)</Text>

          <AppInput
            label="CEP"
            placeholder="Apenas números"
            value={form.cep}
            onChangeText={processarCep}
            keyboardType="numeric"
            maxLength={8}
          />
          <AppInput
            label="Endereço"
            placeholder="Rua, Avenida..."
            value={form.endereco}
            onChangeText={(txt) => setForm({ ...form, endereco: txt })}
          />

          <View style={styles.row}>
            <View style={styles.halfInputLeft}>
              <AppSelect
                label="Estado"
                options={estados}
                value={form.estado}
                onSelect={handleEstadoChange}
                placeholder="UF"
              />
            </View>
            <View style={styles.halfInputRight}>
              <AppSelect
                label="Cidade"
                options={cidades}
                value={form.cidade}
                onSelect={(val) => setForm({ ...form, cidade: val })}
                placeholder={form.estado ? "Selecione..." : "Escolha a UF"}
              />
            </View>
          </View>

          <AppButton
            title={isEditing ? "Salvar Alterações" : "Cadastrar Aluno"}
            onPress={handleSave}
            loading={loading}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingVertical: spacing.sm, paddingBottom: spacing.xxl },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInputRight: { flex: 2, marginRight: spacing.sm },
  halfInputLeft: { flex: 1, marginLeft: spacing.sm },
  submitBtn: { marginTop: spacing.lg },
});
