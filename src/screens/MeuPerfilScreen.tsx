import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/Header";
import { AppInput } from "../components/Input";
import { AppButton } from "../components/Button";
import { AppSelect } from "../components/Select";
import { alunoService } from "../services/aluno.service";
import { professorService } from "../services/professor.service";
import { useAuth } from "../contexts/AuthContext";
import { AlertHelper } from "../utils/AlertHelper";

interface IBGEUF {
  id: number;
  sigla: string;
  nome: string;
}
interface IBGECidade {
  id: number;
  nome: string;
}

export default function MeuPerfilScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  const isAluno = user?.role === "ALUNO";
  const isProfessor = user?.role === "PROFESSOR";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [estados, setEstados] = useState<string[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);

  // O estado unificado suporta os campos de ambos os perfis
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    // Campos Aluno
    matricula: "",
    curso: "",
    telefone: "",
    cep: "",
    endereco: "",
    cidade: "",
    estado: "",
    // Campos Professor
    titulacao: "",
    area: "",
    tempo_docencia: "",
  });

  useEffect(() => {
    carregarDados();
    if (isAluno) buscarEstadosIBGE();
  }, []);

  const carregarDados = async () => {
    if (!user?.email) return;
    try {
      let dados: any = {};

      if (isAluno) {
        dados = await alunoService.getMeuPerfil(user.email);
        if (dados.estado) buscarCidadesIBGE(dados.estado);
      } else if (isProfessor) {
        dados = await professorService.getMeuPerfil(user.email);
      }

      setForm((prev) => ({ ...prev, ...dados, senha: "" }));
    } catch (error) {
      AlertHelper.show("Erro", "Não foi possível carregar os seus dados.");
    } finally {
      setLoading(false);
    }
  };

  const buscarEstadosIBGE = async () => {
    try {
      const res = await axios.get<IBGEUF[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
      );
      setEstados(
        res.data
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((uf) => uf.sigla),
      );
    } catch (error) {}
  };

  const buscarCidadesIBGE = async (siglaUF: string) => {
    try {
      const res = await axios.get<IBGECidade[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${siglaUF}/municipios`,
      );
      setCidades(
        res.data
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((c) => c.nome),
      );
    } catch (error) {}
  };

  const handleEstadoChange = (uf: string) => {
    setForm((prev) => ({ ...prev, estado: uf, cidade: "" }));
    buscarCidadesIBGE(uf);
  };

  const buscarCep = async (cep: string) => {
    const cepNumeros = cep.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, cep: cepNumeros }));

    if (cepNumeros.length === 8) {
      try {
        const res = await axios.get(
          `https://viacep.com.br/ws/${cepNumeros}/json/`,
        );
        if (!res.data.erro) {
          setForm((prev) => ({
            ...prev,
            endereco: res.data.logradouro,
            estado: res.data.uf,
            cidade: res.data.localidade,
          }));
          buscarCidadesIBGE(res.data.uf);
        }
      } catch (error) {}
    }
  };

  const handleSave = async () => {
    if (!form.email.trim())
      return AlertHelper.show("Atenção", "O e-mail é obrigatório.");

    setSaving(true);
    try {
      if (isAluno) {
        await alunoService.updateMeuPerfil(user!.email, form);
      } else if (isProfessor) {
        await professorService.updateMeuPerfil(user!.email, form);
      }

      if (form.email !== user?.email || form.senha.length > 0) {
        AlertHelper.show("Sucesso", "Perfil atualizado! Faça login novamente.");
        signOut();
      } else {
        AlertHelper.show("Sucesso", "Os seus dados foram atualizados.");
        navigation.goBack();
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || "Falha ao atualizar perfil.";
      AlertHelper.show("Erro", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <ScreenContainer>
      <Header title="Meu Perfil" showBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Dados Institucionais (Somente Leitura)
          </Text>
          <AppInput
            label="Nome"
            value={form.nome}
            editable={false}
            style={styles.disabledInput}
          />

          {/* Renderização Condicional baseada no Perfil */}
          {isAluno && (
            <View style={styles.row}>
              <View style={styles.halfInputRight}>
                <AppInput
                  label="Matrícula"
                  value={form.matricula}
                  editable={false}
                  style={styles.disabledInput}
                />
              </View>
              <View style={styles.halfInputLeft}>
                <AppInput
                  label="Curso"
                  value={form.curso}
                  editable={false}
                  style={styles.disabledInput}
                />
              </View>
            </View>
          )}

          {isProfessor && (
            <View style={styles.row}>
              <View style={styles.halfInputRight}>
                <AppInput
                  label="Titulação"
                  value={form.titulacao}
                  editable={false}
                  style={styles.disabledInput}
                />
              </View>
              <View style={styles.halfInputLeft}>
                <AppInput
                  label="Área"
                  value={form.area}
                  editable={false}
                  style={styles.disabledInput}
                />
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Dados de Acesso e Contato</Text>
          <AppInput
            label="E-mail *"
            value={form.email}
            onChangeText={(txt) => setForm({ ...form, email: txt })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Nova Senha (deixe em branco para manter)"
            placeholder="Digite a nova senha"
            value={form.senha}
            onChangeText={(txt) => setForm({ ...form, senha: txt })}
            secureTextEntry
          />

          {isProfessor && (
            <AppInput
              label="Tempo de Docência"
              placeholder="Ex: 5 anos"
              value={form.tempo_docencia}
              onChangeText={(txt) => setForm({ ...form, tempo_docencia: txt })}
            />
          )}

          {/* O endereço é gerido apenas para os Alunos de acordo com o seu modelo de dados */}
          {isAluno && (
            <>
              <AppInput
                label="Telefone"
                value={form.telefone}
                onChangeText={(txt) => setForm({ ...form, telefone: txt })}
                keyboardType="phone-pad"
              />
              <Text style={styles.sectionTitle}>Endereço</Text>
              <AppInput
                label="CEP"
                value={form.cep}
                onChangeText={buscarCep}
                keyboardType="numeric"
                maxLength={8}
              />
              <AppInput
                label="Endereço"
                value={form.endereco}
                onChangeText={(txt) => setForm({ ...form, endereco: txt })}
              />
              <View style={styles.row}>
                <View style={styles.halfInputRight}>
                  <AppSelect
                    label="Cidade"
                    options={cidades}
                    value={form.cidade}
                    onSelect={(val) => setForm({ ...form, cidade: val })}
                    placeholder={form.estado ? "Selecione..." : "Escolha a UF"}
                  />
                </View>
                <View style={styles.halfInputLeft}>
                  <AppSelect
                    label="Estado"
                    options={estados}
                    value={form.estado}
                    onSelect={handleEstadoChange}
                    placeholder="UF"
                  />
                </View>
              </View>
            </>
          )}

          <AppButton
            title="Guardar Alterações"
            onPress={handleSave}
            loading={saving}
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
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  disabledInput: { backgroundColor: "#F1F5F9", color: "#94A3B8" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInputRight: { flex: 1, marginRight: spacing.sm },
  halfInputLeft: { flex: 1, marginLeft: spacing.sm },
  submitBtn: { marginTop: spacing.lg },
});
