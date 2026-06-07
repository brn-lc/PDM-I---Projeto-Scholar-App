import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
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
import { useApi } from "../hooks/useApi";
import { AppNavigationProp } from "../navigation/types";
import { AlertHelper } from "../utils/AlertHelper";
import { Aluno } from "../navigation/types";

// Aplicação do tipo centralizado para a navegação deste ecrã
type AlunosNavProp = AppNavigationProp<"AlunosList">;

export default function AlunosListScreen() {
  const navigation = useNavigation<AlunosNavProp>();
  const isFocused = useIsFocused();

  // Utilização do Hook customizado para gerir a chamada à API
  const { data: alunos, loading, request } = useApi<Aluno[]>();
  const [searchQuery, setSearchQuery] = useState("");

  const carregarAlunos = () => request(alunoService.getAll);

  useEffect(() => {
    if (isFocused) carregarAlunos();
  }, [isFocused]);

  const handleDelete = (id: number, nome: string) => {
    AlertHelper.confirm(
      "Excluir Aluno",
      `Deseja excluir o aluno ${nome}?`,
      async () => {
        await alunoService.delete(id);
        carregarAlunos(); // Recarrega a lista após a exclusão
      },
    );
  };

  const filtrados = (alunos || []).filter((a) =>
    a.nome?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Mostra o loading inicial, mas permite que a lista fique visível durante um "refresh"
  if (loading && !alunos) return <Loading />;

  return (
    <ScreenContainer>
      <Header
        title="Alunos"
        showBack
        rightElement={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CadastroAluno")}
          >
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <SearchBar
        placeholder="Buscar aluno..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBg}>
              <Feather name="user" size={24} color={colors.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{item.nome}</Text>
              <Text style={styles.subtitle}>{item.email}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: "#DBEAFE" }]}
                onPress={() =>
                  navigation.navigate("CadastroAluno", { alunoEdit: item })
                }
              >
                <Feather name="edit-2" size={18} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: "#FEF2F2" }]}
                onPress={() => handleDelete(item.id, item.nome)}
              >
                <Feather name="trash-2" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState iconName="users" message="Nenhum aluno encontrado." />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingVertical: spacing.sm,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 24,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  iconBg: {
    width: 48,
    height: 48,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
