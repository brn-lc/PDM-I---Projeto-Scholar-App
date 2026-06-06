import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useIsFocused,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { EmptyState } from "../components/EmptyState";
import { disciplinaService } from "../services/disciplina.service";
import { AlertHelper } from "../utils/AlertHelper";
import { RootStackParamList, Disciplina, Aluno } from "../navigation/types";

type DetailRouteProp = RouteProp<RootStackParamList, "DisciplinaDetail">;
type DetailNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "DisciplinaDetail"
>;

type DisciplinaComAlunos = Disciplina & { alunos: Aluno[] };

export default function DisciplinaDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<DetailNavProp>();
  const isFocused = useIsFocused();
  const { id, nome } = route.params;

  const [detalhes, setDetalhes] = useState<DisciplinaComAlunos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      carregarDetalhes();
    }
  }, [isFocused]);

  const carregarDetalhes = async () => {
    try {
      const data = await disciplinaService.getById(id);
      setDetalhes(data);
    } catch (error) {
      AlertHelper.show("Erro", "Não foi possível carregar os detalhes.");
    } finally {
      setLoading(false);
    }
  };

  const executarRemocao = async (alunoId: number) => {
    try {
      await disciplinaService.removerAluno(id, alunoId);
      carregarDetalhes();
    } catch (error) {
      AlertHelper.show("Erro", "Falha ao remover aluno.");
    }
  };

  const confirmarRemocao = (alunoId: number, nomeAluno: string) => {
    AlertHelper.confirm(
      "Remover Aluno",
      `Deseja remover ${nomeAluno} desta disciplina?`,
      () => executarRemocao(alunoId),
    );
  };

  if (loading) return <Loading />;

  return (
    <ScreenContainer>
      <Header title="Detalhes" showBack />

      <View style={styles.headerCard}>
        <View style={styles.headerIconBg}>
          <Feather name="book-open" size={32} color="#F97316" />
        </View>
        <Text style={styles.headerTitle}>{detalhes?.nome || nome}</Text>
        <Text style={styles.headerSubtitle}>
          <Feather name="clock" size={14} color={colors.textSecondary} />{" "}
          {detalhes?.carga_horaria || 0}h de Carga Horária
        </Text>

        {(detalhes?.curso || detalhes?.semestre) && (
          <Text
            style={[
              styles.headerSubtitle,
              { marginTop: 4, color: colors.primary },
            ]}
          >
            <Feather name="bookmark" size={12} /> {detalhes?.curso} •{" "}
            {detalhes?.semestre}
          </Text>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Professor Responsável</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: "#F3E8FF" }]}>
          <Feather name="user" size={24} color="#A855F7" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {detalhes?.professor ? detalhes.professor.nome : "Sem professor"}
          </Text>
          <Text style={styles.cardSubtitle}>
            {detalhes?.professor ? "Atribuído" : "Clique em 'Atribuir'"}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            !detalhes?.professor && styles.actionBtnHighlight,
          ]}
          onPress={() =>
            navigation.navigate("SelecionarProfessor", { disciplinaId: id })
          }
        >
          <Text
            style={[
              styles.actionBtnText,
              !detalhes?.professor && { color: colors.surface },
            ]}
          >
            {detalhes?.professor ? "Trocar" : "Atribuir"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
        <Text style={styles.sectionTitle}>Alunos Matriculados</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            navigation.navigate("AdicionarAlunoDisciplina", {
              disciplinaId: id,
            })
          }
        >
          <Feather name="plus" size={16} color={colors.surface} />
          <Text style={styles.addBtnText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={detalhes?.alunos || []}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#DBEAFE" }]}
            >
              <Feather name="users" size={20} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.cardSubtitle}>{item.email || "Aluno"}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => confirmarRemocao(item.id, item.nome)}
            >
              <Feather name="trash-2" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            iconName="users"
            message="Nenhum aluno matriculado ainda."
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 24,
    marginBottom: spacing.lg,
    elevation: 3,
  },
  headerIconBg: {
    width: 64,
    height: 64,
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.sm,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: { fontSize: typography.size.xs, color: colors.textSecondary },
  actionBtn: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  actionBtnHighlight: { backgroundColor: "#A855F7" },
  actionBtnText: {
    color: colors.text,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xs,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: colors.surface,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xs,
  },
  removeBtn: { padding: 8, backgroundColor: "#FEF2F2", borderRadius: 10 },
});
