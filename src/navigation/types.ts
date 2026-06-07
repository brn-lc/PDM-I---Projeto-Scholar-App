import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// ==========================================
// TIPAGEM DAS ENTIDADES PRINCIPAIS
// ==========================================

export interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  curso?: string;
  email: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
}

export interface Professor {
  id: number;
  nome: string;
  email: string;
  titulacao?: string;
  area?: string;
  tempo_docencia?: string;
}

export interface Disciplina {
  id: number;
  nome: string;
  carga_horaria: number;
  curso: string;
  semestre: string;
  professor?: Professor | null;
  professor_id?: number | null;
}

// ==========================================
// TIPAGEM DAS ROTAS DA APLICAÇÃO
// ==========================================

export type RootStackParamList = {
  // Autenticação e Principal
  Login: undefined;
  Dashboard: undefined;
  MeuPerfil: undefined;

  // Listagens
  AlunosList: undefined;
  ProfessoresList: undefined;
  DisciplinasList: undefined;

  // Boletim
  Boletim: undefined;

  // Formulários de Criação/Edição
  CadastroAluno: { alunoEdit?: Aluno } | undefined;
  CadastroProfessor: { professorEdit?: Professor } | undefined;
  CreateDisciplina: { disciplinaEdit?: Disciplina } | undefined;

  // Fluxo de Gestão da Disciplina
  DisciplinaDetail: { id: number; nome: string };
  SelecionarProfessor: { disciplinaId: number };
  AdicionarAlunoDisciplina: { disciplinaId: number };
};

// ==========================================
// TIPO UTILITÁRIO DE NAVEGAÇÃO GLOBAL
// ==========================================

/**
 * Utilize este tipo nos seus ecrãs para ter a navegação estritamente tipada.
 * Exemplo de uso num ecrã:
 * const navigation = useNavigation<AppNavigationProp<"NomeDaSuaRota">>();
 */
export type AppNavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;
