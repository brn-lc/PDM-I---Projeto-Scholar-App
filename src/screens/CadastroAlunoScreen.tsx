import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { AlertHelper } from "../utils/AlertHelper";
import { RootStackParamList } from "../navigation/types";

type CadastroAlunoNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "CadastroAluno"
>;
type CadastroAlunoRouteProp = RouteProp<RootStackParamList, "CadastroAluno">;

interface IBGEUF {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECidade {
  id: number;
  nome: string;
}

export default function CadastroAlunoScreen() {
  const navigation = useNavigation<CadastroAlunoNavProp>();
  const route = useRoute<CadastroAlunoRouteProp>();

  const { alunoEdit } = route.params || {};
  const isEditing = !!alunoEdit;

  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState<string[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);

  // Estados isolados para o controle visual de erros (Feedback Inline)
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
    buscarEstadosIBGE();
    if (alunoEdit?.estado) {
      buscarCidadesIBGE(alunoEdit.estado);
    }
  }, []);

  const buscarEstadosIBGE = async () => {
    try {
      const res = await axios.get<IBGEUF[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
      );
      const ufsOrdenadas = res.data
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((uf) => uf.sigla);
      setEstados(ufsOrdenadas);
    } catch (error) {
      console.error("Erro ao carregar estados do IBGE:", error);
    }
  };

  const buscarCidadesIBGE = async (siglaUF: string) => {
    try {
      const res = await axios.get<IBGECidade[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${siglaUF}/municipios`,
      );
      const cidadesOrdenadas = res.data
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((cidade) => cidade.nome);
      setCidades(cidadesOrdenadas);
    } catch (error) {
      console.error("Erro ao carregar cidades do IBGE:", error);
    }
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
          const ufObtido = res.data.uf;
          const cidadeObtida = res.data.localidade;

          setForm((prev) => ({
            ...prev,
            endereco: res.data.logradouro,
            estado: ufObtido,
            cidade: cidadeObtida,
          }));

          buscarCidadesIBGE(ufObtido);
        } else {
          AlertHelper.show("Aviso", "CEP não encontrado.");
        }
      } catch (error) {
        AlertHelper.show("Erro", "Não foi possível buscar o CEP via ViaCEP.");
      }
    }
  };

  const handleSave = async () => {
    // Resetando estados de erro antes da nova validação
    setNomeError("");
    setMatriculaError("");
    setEmailError("");

    let hasError = false;

    // Validação inline e rigorosa dos campos obrigatórios acadêmicos
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

    // Se houver algum erro de preenchimento, interrompe o fluxo antes de tocar na API
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
      AlertHelper.show("Erro", "Falha ao salvar aluno no backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Ativa o gerenciamento global de teclado do ScreenContainer e limpa a árvore do layout
    <ScreenContainer withKeyboard>
      <Header title={isEditing ? "Editar Aluno" : "Novo Aluno"} showBack />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Dados Acadêmicos e Pessoais</Text>

        <AppInput
          label="Nome *"
          placeholder="Nome completo"
          value={form.nome}
          onChangeText={(txt) => {
            setForm({ ...form, nome: txt });
            if (nomeError) setNomeError(""); // Limpa o erro ao digitar
          }}
          error={nomeError}
        />
        <AppInput
          label="Matrícula *"
          placeholder="Ex: 123456"
          value={form.matricula}
          onChangeText={(txt) => {
            setForm({ ...form, matricula: txt });
            if (matriculaError) setMatriculaError(""); // Limpa o erro ao digitar
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
            if (emailError) setEmailError(""); // Limpa o erro ao digitar
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
          placeholder="Somente números"
          value={form.cep}
          onChangeText={buscarCep}
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

        <AppButton
          title={isEditing ? "Guardar Alterações" : "Salvar Aluno"}
          onPress={handleSave}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
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
