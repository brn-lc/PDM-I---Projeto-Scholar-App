import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ScreenContainer } from "../components/ScreenContainer";
import { SearchBar } from "../components/SearchBar";
import { AppNavigationProp } from "../navigation/types";
import { boletimService } from "../services/boletim.service";
import { useApi } from "../hooks/useApi";

type DashboardNavProp = AppNavigationProp<"Dashboard">;

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<DashboardNavProp>();
  const isFocused = useIsFocused();
  const [search, setSearch] = useState("");

  // Usamos o nosso Hook para procurar o boletim caso o utilizador seja ALUNO
  const { data: boletim, request: fetchBoletim } = useApi<any[]>();

  useEffect(() => {
    if (isFocused && user?.role === "ALUNO" && user?.email) {
      fetchBoletim(() => boletimService.getBoletimAluno(user.email));
    }
  }, [isFocused, user]);

  // Lógica Funcional: Cálculo do Progresso do Semestre
  let progresso = 0;
  if (boletim && boletim.length > 0) {
    const concluidas = boletim.filter(
      (b) => b.situacao === "Aprovado" || b.situacao === "Reprovado",
    ).length;
    progresso = Math.round((concluidas / boletim.length) * 100);
  }

  // Função para formatar o nome em Title Case (Camel Case com espaços)
  const formatarNome = (nome?: string) => {
    if (!nome) return "Usuário";
    return nome
      .replace(/[._-]/g, " ") // Substitui pontos, traços e underscores por espaços
      .split(" ")
      .map(
        (palavra) =>
          palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase(),
      )
      .join(" ");
  };

  const obterTituloNota = () => {
    return user?.role === "ALUNO" ? "Meu Boletim" : "Gestão de Notas";
  };

  const handleSearch = () => {
    const query = search.trim().toLowerCase();
    if (!query) return;

    if (query.includes("prof")) {
      navigation.navigate("ProfessoresList");
    } else if (query.includes("disc")) {
      navigation.navigate("DisciplinasList");
    } else if (query.includes("nota") || query.includes("boletim")) {
      navigation.navigate("Boletim");
    } else {
      navigation.navigate("AlunosList");
    }

    setSearch("");
  };

  const menuItems = [
    {
      id: "profile", // NOVO BOTÃO
      title: "Meu Perfil",
      icon: "settings" as const, // Ícone de engrenagem
      color: "#0EA5E9", // Um azul diferente para destacar
      route: "MeuPerfil" as const,
    },
    {
      id: "students",
      title: "Alunos",
      icon: "users" as const,
      color: colors.primary,
      route: "AlunosList" as const,
    },
    {
      id: "teachers",
      title: "Professores",
      icon: "user" as const,
      color: "#A855F7",
      route: "ProfessoresList" as const,
    },
    {
      id: "subjects",
      title: "Disciplinas",
      icon: "book-open" as const,
      color: "#F97316",
      route: "DisciplinasList" as const,
    },
    {
      id: "report",
      title: obterTituloNota(),
      icon: "clipboard" as const,
      color: colors.success,
      route: "Boletim" as const,
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (user?.role === "ADMIN") return item.id !== "profile";
    if (user?.role === "PROFESSOR")
      return ["report", "profile"].includes(item.id);
    if (user?.role === "ALUNO") return ["report", "profile"].includes(item.id);
    return false;
  });

  return (
    <ScreenContainer noPadding>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.email}`,
                }}
                style={styles.avatar}
              />
            </View>
            <View>
              <Text style={styles.welcomeText}>Bem-vindo de volta</Text>
              {/* Nome agora formatado adequadamente e impedindo quebra de linha */}
              <Text style={styles.userName} numberOfLines={1}>
                {formatarNome(user?.nome)}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
              <Feather name="log-out" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Pesquisar (ex: alunos, professores)..."
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Menu Principal</Text>

        <View style={styles.gridContainer}>
          {filteredMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate(item.route)}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: item.color }]}
              >
                <Feather name={item.icon} size={28} color="white" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {user?.role === "ALUNO" && (
          <View style={styles.statsCard}>
            <View style={{ zIndex: 10 }}>
              <Text style={styles.statsTitle}>Status do Semestre</Text>
              <Text style={styles.statsSubtitle}>
                Você concluiu {progresso}% das disciplinas
              </Text>
              <View style={styles.progressBarBackground}>
                {/* A largura da barra de progresso agora é baseada no cálculo real */}
                <View
                  style={[styles.progressBarFill, { width: `${progresso}%` }]}
                />
              </View>
            </View>
            <Feather
              name="award"
              size={100}
              color="rgba(255,255,255,0.1)"
              style={styles.statsIconBg}
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 5,
    ...Platform.select({
      web: { boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)" },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatarContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#DBEAFE",
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { width: "100%", height: "100%" },
  welcomeText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
    textTransform: "uppercase",
  },
  userName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text,
    maxWidth: 150, // Garante que nomes grandes não quebrem o layout
  },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { flex: 1, padding: spacing.lg },
  sectionTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    width: "47%",
    padding: spacing.lg,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.03)" },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.text,
    textAlign: "center",
  },
  statsCard: {
    backgroundColor: colors.primary,
    borderRadius: 32,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    overflow: "hidden",
    position: "relative",
  },
  statsTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  statsSubtitle: {
    fontSize: typography.size.sm,
    color: "#DBEAFE",
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#3B82F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: colors.surface },
  statsIconBg: {
    position: "absolute",
    right: -20,
    bottom: -20,
    transform: [{ rotate: "15deg" }],
  },
});
