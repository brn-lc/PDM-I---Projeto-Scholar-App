import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { boletimService, NotaAtualizacao } from "../services/boletim.service";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/Header";
import { EmptyState } from "../components/EmptyState";
import { Loading } from "../components/Loading";
import { AppButton } from "../components/Button";
import { AlertHelper } from "../utils/AlertHelper";

// Tipagens rigorosas
export interface BoletimAlunoItem {
  id: string;
  disciplina: string;
  nota1: string | number;
  nota2: string | number;
  media: string | number;
  situacao: string;
}

export interface NotaGestao {
  id: string;
  alunoNome: string;
  matricula: string;
  nota1: string | number;
  nota2: string | number;
  media: string | number;
  situacao: string;
}

export interface DisciplinaGestao {
  id: string;
  nome: string;
  professor: string;
  notas: NotaGestao[];
}

// 1. Componente Memoizado para o Aluno (Evita re-renders desnecessários)
const AlunoItemCard = memo(({ item }: { item: BoletimAlunoItem }) => {
  const isAprovado = item.situacao === "Aprovado";
  const isReprovado = item.situacao === "Reprovado";

  return (
    <View style={styles.cardGestao}>
      <Text style={styles.disciplinaNome}>{item.disciplina}</Text>
      <View style={styles.notasRow}>
        <View style={styles.notaBox}>
          <Text style={styles.notaLabel}>Nota 1</Text>
          <Text style={styles.notaValor}>{item.nota1 || "-"}</Text>
        </View>
        <View style={styles.notaBox}>
          <Text style={styles.notaLabel}>Nota 2</Text>
          <Text style={styles.notaValor}>{item.nota2 || "-"}</Text>
        </View>
        <View
          style={[
            styles.notaBox,
            {
              backgroundColor: isAprovado
                ? `${colors.success}15`
                : isReprovado
                  ? `${colors.danger}15`
                  : colors.background,
            },
          ]}
        >
          <Text style={styles.notaLabel}>Média</Text>
          <Text
            style={[
              styles.notaValor,
              {
                color: isAprovado
                  ? colors.success
                  : isReprovado
                    ? colors.danger
                    : colors.text,
              },
            ]}
          >
            {item.media || "-"}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: isAprovado
              ? colors.success
              : isReprovado
                ? colors.danger
                : colors.textSecondary,
          },
        ]}
      >
        <Text style={styles.statusText}>{item.situacao}</Text>
      </View>
    </View>
  );
});

export default function BoletimScreen() {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [gestaoDisciplinas, setGestaoDisciplinas] = useState<
    DisciplinaGestao[]
  >([]);
  const [boletimAluno, setBoletimAluno] = useState<BoletimAlunoItem[]>([]);

  useEffect(() => {
    if (isFocused) {
      carregarDados();
    }
  }, [isFocused]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      if (user?.role === "ALUNO") {
        const data = await boletimService.getBoletimAluno(user.email);
        setBoletimAluno(data);
      } else {
        const data = await boletimService.getGestaoNotas();
        setGestaoDisciplinas(data);
      }
    } catch (error) {
      console.error("Erro ao carregar notas", error);
      AlertHelper.show("Erro", "Falha ao obter os dados de notas.");
    } finally {
      setLoading(false);
    }
  };

  // Otimização: useCallback para evitar recriação da função
  const handleNotaChange = useCallback(
    (
      disciplinaId: string,
      matriculaId: string,
      campo: "nota1" | "nota2",
      valor: string,
    ) => {
      const numericVal = valor.replace(/[^0-9.,]/g, "").replace(",", ".");

      setGestaoDisciplinas((prev) =>
        prev.map((disciplina) => {
          if (disciplina.id !== disciplinaId) return disciplina;

          const novasNotas = disciplina.notas.map((aluno) => {
            if (aluno.id !== matriculaId) return aluno;

            const alunoAtualizado = { ...aluno, [campo]: numericVal };
            const n1 = parseFloat(alunoAtualizado.nota1 as string);
            const n2 = parseFloat(alunoAtualizado.nota2 as string);

            if (!isNaN(n1) && !isNaN(n2)) {
              const media = (n1 + n2) / 2;
              alunoAtualizado.media = media.toFixed(1);
              alunoAtualizado.situacao = media >= 6 ? "Aprovado" : "Reprovado";
            } else {
              alunoAtualizado.media = "-";
              alunoAtualizado.situacao = "Cursando";
            }

            return alunoAtualizado;
          });

          return { ...disciplina, notas: novasNotas };
        }),
      );
    },
    [],
  );

  const handleSalvarNotas = useCallback(
    async (disciplina: DisciplinaGestao) => {
      setSavingId(disciplina.id);
      try {
        const payload: NotaAtualizacao[] = disciplina.notas.map((n) => ({
          id: n.id,
          nota1: n.nota1,
          nota2: n.nota2,
          media: n.media,
          situacao: n.situacao,
        }));

        await boletimService.updateNotas(payload);
        AlertHelper.show(
          "Sucesso",
          `Notas da disciplina ${disciplina.nome} guardadas com sucesso!`,
        );
      } catch (error) {
        AlertHelper.show("Erro", "Ocorreu um erro ao guardar as notas.");
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  // 2. Extracão das funções de renderização usando useCallback
  const renderGestaoItem = useCallback(
    ({ item }: { item: DisciplinaGestao }) => (
      <View style={styles.cardGestao}>
        <Text style={styles.disciplinaNome}>{item.nome}</Text>
        <Text style={styles.profNome}>Prof. {item.professor}</Text>

        {item.notas.length === 0 ? (
          <Text style={styles.emptyText}>Sem alunos matriculados.</Text>
        ) : (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Aluno</Text>
              <Text style={styles.th}>N1</Text>
              <Text style={styles.th}>N2</Text>
              <Text style={styles.th}>Média</Text>
              <Text style={styles.th}>Status</Text>
            </View>

            {item.notas.map((aluno) => {
              const isAprovado = aluno.situacao === "Aprovado";
              const isReprovado = aluno.situacao === "Reprovado";

              return (
                <View key={aluno.id} style={styles.tableRow}>
                  <Text
                    style={[styles.td, { flex: 2, fontWeight: "bold" }]}
                    numberOfLines={1}
                  >
                    {aluno.alunoNome}
                  </Text>
                  <TextInput
                    style={styles.gradeInput}
                    value={aluno.nota1?.toString()}
                    onChangeText={(txt) =>
                      handleNotaChange(item.id, aluno.id, "nota1", txt)
                    }
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <TextInput
                    style={styles.gradeInput}
                    value={aluno.nota2?.toString()}
                    onChangeText={(txt) =>
                      handleNotaChange(item.id, aluno.id, "nota2", txt)
                    }
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <Text style={[styles.td, { fontWeight: "bold" }]}>
                    {aluno.media}
                  </Text>
                  <Text
                    style={[
                      styles.td,
                      {
                        fontSize: 10,
                        fontWeight: "bold",
                        color: isAprovado
                          ? colors.success
                          : isReprovado
                            ? colors.danger
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {aluno.situacao}
                  </Text>
                </View>
              );
            })}

            <AppButton
              title="Guardar Notas da Turma"
              onPress={() => handleSalvarNotas(item)} // <--- Alteração principal aqui
              loading={savingId === item.id}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      </View>
    ),
    [handleNotaChange, handleSalvarNotas, savingId], // <--- As dependências agora estão corretas
  );

  const renderAlunoItem = useCallback(
    ({ item }: { item: BoletimAlunoItem }) => <AlunoItemCard item={item} />,
    [],
  );

  if (loading) return <Loading />;

  return (
    <ScreenContainer>
      <Header
        title={user?.role === "ALUNO" ? "Meu Boletim" : "Gestão de Notas"}
        showBack
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {user?.role === "ALUNO" ? (
          <FlatList
            data={boletimAluno}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAlunoItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                iconName="clipboard"
                message="Nenhuma nota disponível ainda."
              />
            }
          />
        ) : (
          <FlatList
            data={gestaoDisciplinas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderGestaoItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                iconName="folder"
                message="Nenhuma disciplina cadastrada."
              />
            }
          />
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// Manter exatamente os mesmos styles originais abaixo
const styles = StyleSheet.create({
  listContent: { paddingVertical: spacing.sm, paddingBottom: spacing.xxl },
  cardGestao: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disciplinaNome: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  profNome: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  tableContainer: { marginTop: spacing.sm },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  th: {
    flex: 1,
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  td: { flex: 1, fontSize: 12, color: colors.text, textAlign: "center" },
  gradeInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    height: 32,
    textAlign: "center",
    fontSize: 12,
    marginHorizontal: 2,
    color: colors.text,
  },
  notasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  notaBox: {
    flex: 1,
    alignItems: "center",
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  notaLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  notaValor: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  statusBadge: {
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  statusText: {
    color: colors.surface,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
});
