import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { EmptyState } from "../components/EmptyState";
import { Loading } from "../components/Loading";
import { professorService } from "../services/professor.service";
import { disciplinaService } from "../services/disciplina.service";
import { AlertHelper } from "../utils/AlertHelper";
import { RootStackParamList, Professor } from "../navigation/types"; // Tipagem injetada

type SelecionarProfRouteProp = RouteProp<
  RootStackParamList,
  "SelecionarProfessor"
>;

export default function SelecionarProfessorScreen() {
  const route = useRoute<SelecionarProfRouteProp>();
  const navigation = useNavigation();
  const { disciplinaId } = route.params;

  const [professores, setProfessores] = useState<Professor[]>([]); // Remoção do 'any'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [atribuindoId, setAtribuindoId] = useState<number | null>(null);

  useEffect(() => {
    carregarProfessores();
  }, []);

  const carregarProfessores = async () => {
    try {
      const data = await professorService.getAll();
      setProfessores(data);
    } catch (error) {
      console.error("Erro ao carregar professores:", error);
      AlertHelper.show(
        "Erro",
        "Não foi possível carregar a lista de professores.",
      );
    } finally {
      setLoading(false);
    }
  };

  const executarAtribuicao = async (professorId: number) => {
    setAtribuindoId(professorId);
    try {
      await disciplinaService.atribuirProfessor(disciplinaId, professorId);
      AlertHelper.show("Sucesso", "Professor atribuído com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      const msg = error.response?.data?.error || "Falha ao atribuir professor.";
      AlertHelper.show("Erro", msg);
    } finally {
      setAtribuindoId(null);
    }
  };

  const handleAtribuirProfessor = useCallback(
    (professorId: number, nomeProfessor: string) => {
      AlertHelper.confirm(
        "Confirmar Atribuição",
        `Deseja atribuir ${nomeProfessor} a esta disciplina?`,
        () => executarAtribuicao(professorId),
      );
    },
    [disciplinaId],
  );

  const professoresFiltrados = professores.filter(
    (p) =>
      p.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = useCallback(
    ({ item }: { item: Professor }) => (
      <View style={styles.card}>
        <View style={styles.cardIconContainer}>
          <Feather name="user" size={24} color="#A855F7" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardSubtitle}>{item.email}</Text>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleAtribuirProfessor(item.id, item.nome)}
          disabled={atribuindoId === item.id}
        >
          {atribuindoId === item.id ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Text style={styles.actionButtonText}>Atribuir</Text>
          )}
        </TouchableOpacity>
      </View>
    ),
    [atribuindoId, handleAtribuirProfessor],
  );

  if (loading) return <Loading />;

  return (
    <ScreenContainer>
      <Header title="Atribuir Professor" showBack />
      <SearchBar
        placeholder="Buscar professor..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={professoresFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            iconName="user-x"
            message="Nenhum professor encontrado."
          />
        }
      />
    </ScreenContainer>
  );
}

// Manter os styles inalterados...
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
    backgroundColor: "#F3E8FF",
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
    backgroundColor: "#A855F7",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: colors.surface,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
});
