import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { Loading } from "../components/Loading";
import { alunoService } from "../services/aluno.service";
import { disciplinaService } from "../services/disciplina.service";
import { RootStackParamList, Aluno } from "../navigation/types";
import { AlertHelper } from "../utils/AlertHelper";

type AdicionarAlunoRouteProp = RouteProp<
  RootStackParamList,
  "AdicionarAlunoDisciplina"
>;

type AdicionarAlunoNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "AdicionarAlunoDisciplina"
>;

export default function AdicionarAlunoDisciplinaScreen() {
  const route = useRoute<AdicionarAlunoRouteProp>();
  const navigation = useNavigation<AdicionarAlunoNavProp>();
  const { disciplinaId } = route.params;

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [matriculandoId, setMatriculandoId] = useState<number | null>(null);

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    try {
      const data = await alunoService.getAll();
      setAlunos(data);
    } catch (error) {
      AlertHelper.show("Erro", "Não foi possível carregar a lista de alunos.");
    } finally {
      setLoading(false);
    }
  };

  const executarMatricula = async (alunoId: number) => {
    setMatriculandoId(alunoId);
    try {
      await disciplinaService.matricularAluno(disciplinaId, alunoId);
      AlertHelper.show("Sucesso", "Aluno matriculado com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      const msgErro =
        error.response?.data?.error || "Falha ao matricular aluno.";
      AlertHelper.show("Atenção", msgErro);
    } finally {
      setMatriculandoId(null);
    }
  };

  const handleMatricular = (alunoId: number, nomeAluno: string) => {
    AlertHelper.confirm(
      "Confirmar Matrícula",
      `Matricular ${nomeAluno} nesta disciplina?`,
      () => executarMatricula(alunoId),
    );
  };

  const alunosFiltrados = alunos.filter(
    (a) =>
      a.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) return <Loading />;

  return (
    <ScreenContainer>
      <Header title="Matricular Aluno" showBack />

      <SearchBar
        placeholder="Buscar aluno..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={alunosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIconContainer}>
              <Feather name="users" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.cardSubtitle}>{item.email}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.actionButton,
                matriculandoId === item.id && { opacity: 0.7 },
              ]}
              onPress={() => handleMatricular(item.id, item.nome)}
              disabled={matriculandoId === item.id}
            >
              {matriculandoId === item.id ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <View style={styles.btnContent}>
                  <Feather name="plus" size={16} color={colors.surface} />
                  <Text style={styles.actionButtonText}>Matricular</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState iconName="inbox" message="Nenhum aluno encontrado." />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: typography.size.xs, color: colors.textSecondary },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  btnContent: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionButtonText: {
    color: colors.surface,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xs,
  },
});
