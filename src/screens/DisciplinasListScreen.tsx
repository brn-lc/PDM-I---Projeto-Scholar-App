import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
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
import { disciplinaService } from "../services/disciplina.service";
import { AlertHelper } from "../utils/AlertHelper";
import { RootStackParamList, Disciplina } from "../navigation/types";

type DisciplinasNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "DisciplinasList"
>;

export default function DisciplinasListScreen() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = useNavigation<DisciplinasNavProp>();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      carregarDisciplinas();
    }
  }, [isFocused]);

  const carregarDisciplinas = async () => {
    try {
      const data = await disciplinaService.getAll();
      setDisciplinas(data);
    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
    } finally {
      setLoading(false);
    }
  };

  const executarExclusao = async (id: number) => {
    try {
      await disciplinaService.delete(id);
      AlertHelper.show("Sucesso", "Disciplina excluída com sucesso!");
      carregarDisciplinas();
    } catch (error: any) {
      const msgErro =
        error.response?.data?.error || "Erro ao excluir disciplina.";
      AlertHelper.show("Erro", msgErro);
    }
  };

  const handleDelete = (id: number, nome: string) => {
    AlertHelper.confirm(
      "Excluir Disciplina",
      `Tem certeza que deseja excluir ${nome}? Todas as notas e matrículas associadas serão perdidas.`,
      () => executarExclusao(id),
    );
  };

  const disciplinasFiltradas = disciplinas.filter((d) =>
    d.nome.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Disciplina }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() =>
          navigation.navigate("DisciplinaDetail", {
            id: item.id,
            nome: item.nome,
          })
        }
      >
        <View style={styles.cardIconContainer}>
          <Feather name="book-open" size={24} color="#F97316" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardSubtitle}>
            <Feather name="clock" size={12} color={colors.textSecondary} />{" "}
            {item.carga_horaria}h •{" "}
            {item.professor ? `Prof. ${item.professor.nome}` : "Sem professor"}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#FFF7ED" }]}
          onPress={() =>
            navigation.navigate("CreateDisciplina", { disciplinaEdit: item })
          }
        >
          <Feather name="edit-2" size={18} color="#F97316" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#FEF2F2" }]}
          onPress={() => handleDelete(item.id, item.nome)}
        >
          <Feather name="trash-2" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <Loading />;

  return (
    <ScreenContainer>
      <Header
        title="Disciplinas"
        showBack
        rightElement={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateDisciplina")}
          >
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      <SearchBar
        placeholder="Buscar disciplina..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Disciplinas Cadastradas</Text>
        <Text style={styles.listCount}>
          {disciplinasFiltradas.length} totais
        </Text>
      </View>
      <FlatList
        data={disciplinasFiltradas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            iconName="inbox"
            message="Nenhuma disciplina encontrada."
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F97316",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  listTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  listCount: { fontSize: typography.size.sm, color: colors.textSecondary },
  listContent: { paddingBottom: spacing.xxl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  cardTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#FFF7ED",
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
    marginBottom: 2,
  },
  cardSubtitle: { fontSize: 11, color: colors.textSecondary },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
