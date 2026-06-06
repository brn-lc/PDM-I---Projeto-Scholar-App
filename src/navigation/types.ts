// Tipagem das entidades principais do sistema
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
  // O backend pode devolver o objeto professor inteiro ou apenas o ID dependendo da rota
  professor?: Professor | null;
  professor_id?: number | null;
}

// Tipagem das Rotas e dos Parâmetros que cada uma recebe
export type RootStackParamList = {
  // Autenticação e Principal
  Login: undefined;
  Dashboard: undefined;

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
