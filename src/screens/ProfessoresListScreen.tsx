// src/screens/ProfessoresListScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
import { professorService } from "../services/professor.service";
import { AlertHelper } from "../utils/AlertHelper";
import { RootStackParamList, Professor } from "../navigation/types"; // <-- Tipo importado

type ProfessoresNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProfessoresList"
>;

export default function ProfessoresListScreen() {
  const navigation = useNavigation<ProfessoresNavProp>();
  const isFocused = useIsFocused();

  // Utilizando o tipo correto no lugar de any[]
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const carregarProfessores = async () => {
    setLoading(true);
    try {
      const data = await professorService.getAll();
      setProfessores(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) carregarProfessores();
  }, [isFocused]);

  const executarExclusao = async (id: number) => {
    try {
      await professorService.delete(id);
      AlertHelper.show("Sucesso", "Professor excluído com sucesso!");
      carregarProfessores();
    } catch (error: any) {
      const msgErro =
        error.response?.data?.error || "Erro ao excluir professor.";
      AlertHelper.show("Erro", msgErro);
    }
  };

  const handleDelete = (id: number, nome: string) => {
    AlertHelper.confirm(
      "Excluir Professor",
      `Tem certeza que deseja excluir o professor ${nome}?`,
      () => executarExclusao(id),
    );
  };

  const filtered = professores.filter(
    (p) =>
      p.nome?.toLowerCase().includes(search.toLowerCase()) ||
      p.area?.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Professor }) => (
    <View style={styles.card}>
      <View style={styles.avatarIcon}>
        <Feather name="user" size={24} color="#A855F7" />
      </View>
      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.details}>
          {item.titulacao || "Sem titulação"} • {item.area || "Geral"}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#F3E8FF" }]}
          onPress={() =>
            navigation.navigate("CadastroProfessor", { professorEdit: item })
          }
        >
          <Feather name="edit-2" size={18} color="#A855F7" />
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
        title="Professores"
        showBack
        rightElement={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CadastroProfessor")}
          >
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <SearchBar
        placeholder="Pesquisar por nome ou área..."
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
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

const styles = StyleSheet.create({
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#A855F7",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: { paddingVertical: spacing.sm, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  avatarIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  nome: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  details: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionButtons: { flexDirection: "row", gap: spacing.sm },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
