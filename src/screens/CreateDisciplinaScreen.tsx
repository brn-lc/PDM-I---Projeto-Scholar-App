import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/Header";
import { AppInput } from "../components/Input";
import { AppButton } from "../components/Button";
import { professorService } from "../services/professor.service";
import { disciplinaService } from "../services/disciplina.service";
import { AlertHelper } from "../utils/AlertHelper";
import { RootStackParamList, Professor } from "../navigation/types";

type CreateDisciplinaNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreateDisciplina"
>;
type CreateDisciplinaRouteProp = RouteProp<
  RootStackParamList,
  "CreateDisciplina"
>;

export default function CreateDisciplinaScreen() {
  const navigation = useNavigation<CreateDisciplinaNavProp>();
  const route = useRoute<CreateDisciplinaRouteProp>();

  const { disciplinaEdit } = route.params || {};
  const isEditing = !!disciplinaEdit;

  const [nome, setNome] = useState(disciplinaEdit?.nome || "");
  const [cargaHoraria, setCargaHoraria] = useState(
    disciplinaEdit?.carga_horaria?.toString() || "",
  );
  const [curso, setCurso] = useState(disciplinaEdit?.curso || "");
  const [semestre, setSemestre] = useState(disciplinaEdit?.semestre || "");

  const initialProfessorId =
    disciplinaEdit?.professor_id || disciplinaEdit?.professor?.id || null;
  const [professorId, setProfessorId] = useState<number | null>(
    initialProfessorId,
  );

  // Estados de erro visual
  const [nomeError, setNomeError] = useState("");
  const [cargaHorariaError, setCargaHorariaError] = useState("");
  const [cursoError, setCursoError] = useState("");
  const [semestreError, setSemestreError] = useState("");
  const [professorError, setProfessorError] = useState("");

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProfs, setFetchingProfs] = useState(true);

  useEffect(() => {
    carregarProfessores();
  }, []);

  const carregarProfessores = async () => {
    try {
      const data = await professorService.getAll();
      setProfessores(data);
    } catch (error) {
      AlertHelper.show(
        "Erro",
        "Não foi possível carregar a lista de professores.",
      );
    } finally {
      setFetchingProfs(false);
    }
  };

  const handleSave = async () => {
    // Resetando os erros
    setNomeError("");
    setCargaHorariaError("");
    setCursoError("");
    setSemestreError("");
    setProfessorError("");

    let hasError = false;

    // Validação inline
    if (!nome.trim()) {
      setNomeError("Obrigatório");
      hasError = true;
    }
    if (!cargaHoraria.trim()) {
      setCargaHorariaError("Obrigatório");
      hasError = true;
    }
    if (!curso.trim()) {
      setCursoError("Obrigatório");
      hasError = true;
    }
    if (!semestre.trim()) {
      setSemestreError("Obrigatório");
      hasError = true;
    }
    if (!professorId) {
      setProfessorError("Selecione um professor.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const payload = {
        nome,
        carga_horaria: parseInt(cargaHoraria, 10),
        curso,
        semestre,
        professor_id: professorId,
      };

      if (isEditing && disciplinaEdit) {
        await disciplinaService.update(disciplinaEdit.id, payload);
        AlertHelper.show("Sucesso", "Disciplina atualizada com sucesso!");
      } else {
        await disciplinaService.create(payload);
        AlertHelper.show("Sucesso", "Disciplina cadastrada com sucesso!");
      }
      navigation.goBack();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Erro ao guardar disciplina.";
      AlertHelper.show("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer withKeyboard>
      <Header
        title={isEditing ? "Editar Disciplina" : "Nova Disciplina"}
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppInput
          label="Nome da Disciplina *"
          placeholder="Ex: Matemática Aplicada"
          value={nome}
          onChangeText={(txt) => {
            setNome(txt);
            if (nomeError) setNomeError("");
          }}
          error={nomeError}
        />

        <AppInput
          label="Curso Vinculado *"
          placeholder="Ex: Engenharia de Software"
          value={curso}
          onChangeText={(txt) => {
            setCurso(txt);
            if (cursoError) setCursoError("");
          }}
          error={cursoError}
        />

        <View style={styles.row}>
          <View style={styles.halfInputRight}>
            <AppInput
              label="Carga Horária *"
              placeholder="Ex: 80"
              keyboardType="numeric"
              value={cargaHoraria}
              onChangeText={(txt) => {
                setCargaHoraria(txt);
                if (cargaHorariaError) setCargaHorariaError("");
              }}
              error={cargaHorariaError}
            />
          </View>
          <View style={styles.halfInputLeft}>
            <AppInput
              label="Semestre *"
              placeholder="Ex: 1º Semestre"
              value={semestre}
              onChangeText={(txt) => {
                setSemestre(txt);
                if (semestreError) setSemestreError("");
              }}
              error={semestreError}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Professor Responsável *</Text>
          {fetchingProfs ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.loader}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.professorsScroll}
            >
              {professores.map((prof) => {
                const isSelected = professorId === prof.id;
                return (
                  <TouchableOpacity
                    key={prof.id}
                    style={[
                      styles.professorChip,
                      isSelected && styles.professorChipSelected,
                      professorError &&
                        !professorId &&
                        styles.professorChipError,
                    ]}
                    onPress={() => {
                      setProfessorId(prof.id);
                      if (professorError) setProfessorError("");
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="user"
                      size={16}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.professorChipText,
                        {
                          color: isSelected
                            ? colors.primary
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {prof.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          {/* Exibe o erro visual caso nenhum professor seja selecionado */}
          {professorError ? (
            <Text style={styles.errorText}>{professorError}</Text>
          ) : null}
        </View>

        <AppButton
          title={isEditing ? "Guardar Alterações" : "Cadastrar Disciplina"}
          onPress={handleSave}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInputRight: { flex: 1, marginRight: spacing.sm },
  halfInputLeft: { flex: 1, marginLeft: spacing.sm },
  inputGroup: { marginBottom: spacing.md },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  loader: { alignSelf: "flex-start", marginTop: spacing.sm },
  professorsScroll: { flexDirection: "row", paddingVertical: spacing.xs },
  professorChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginRight: spacing.md,
    gap: spacing.sm,
  },
  professorChipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EFF6FF",
  },
  professorChipError: {
    borderColor: colors.danger,
    backgroundColor: "#FEF2F2",
  },
  professorChipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
  submitBtn: { marginTop: spacing.lg },
});
