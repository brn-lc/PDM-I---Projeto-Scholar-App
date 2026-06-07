const db = require("../database/db");
const bcrypt = require("bcrypt");

// ==========================================
// LISTAGENS DE USUÁRIOS
// ==========================================
exports.listarAlunos = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM alunos");
    res.json(result.rows);
  } catch (error) {
    console.error("[Erro] Listar Alunos:", error);
    res.status(500).json({ error: "Erro ao listar alunos." });
  }
};

exports.listarProfessores = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM professores");
    res.json(result.rows);
  } catch (error) {
    console.error("[Erro] Listar Professores:", error);
    res.status(500).json({ error: "Erro ao listar professores." });
  }
};

// ==========================================
// GESTÃO DE DISCIPLINAS
// ==========================================
exports.listarDisciplinas = async (req, res) => {
  try {
    const query = `
      SELECT d.*, p.nome as professor_nome, p.email as professor_email 
      FROM disciplinas d 
      LEFT JOIN professores p ON d.professor_id = p.id
    `;
    const result = await db.query(query);

    const disciplinas = result.rows.map((d) => ({
      id: d.id,
      nome: d.nome,
      carga_horaria: d.carga_horaria,
      curso: d.curso,
      semestre: d.semestre,
      professor: d.professor_id
        ? {
            id: d.professor_id,
            nome: d.professor_nome,
            email: d.professor_email,
          }
        : null,
    }));

    res.json(disciplinas);
  } catch (error) {
    console.error("[Erro] Listar Disciplinas:", error);
    res.status(500).json({ error: "Erro ao carregar disciplinas." });
  }
};

exports.deletarDisciplina = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM disciplinas WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Disciplina não encontrada." });
    }

    res.json({ message: "Disciplina excluída com sucesso." });
  } catch (error) {
    console.error("[Erro] Deletar Disciplina:", error);
    res.status(500).json({ error: "Erro ao excluir disciplina." });
  }
};

exports.atualizarDisciplina = async (req, res) => {
  const { id } = req.params;
  const { nome, carga_horaria, curso, semestre, professor_id } = req.body;

  try {
    const result = await db.query(
      "UPDATE disciplinas SET nome = $1, carga_horaria = $2, curso = $3, semestre = $4, professor_id = $5 WHERE id = $6 RETURNING *",
      [nome, carga_horaria, curso, semestre, professor_id, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Disciplina não encontrada." });
    }

    res.json({
      message: "Disciplina atualizada com sucesso.",
      disciplina: result.rows[0],
    });
  } catch (error) {
    console.error("[Erro] Atualizar Disciplina:", error);
    res.status(500).json({ error: "Erro ao atualizar disciplina." });
  }
};

exports.criarDisciplina = async (req, res) => {
  const { nome, carga_horaria, curso, semestre, professor_id } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO disciplinas (nome, carga_horaria, curso, semestre, professor_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, carga_horaria, curso, semestre, professor_id],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("[Erro] Criar Disciplina:", error);
    res.status(500).json({ error: "Erro ao criar disciplina." });
  }
};

exports.detalhesDisciplina = async (req, res) => {
  const { id } = req.params;
  try {
    const discQuery = `
      SELECT d.*, p.id as prof_id, p.nome as prof_nome 
      FROM disciplinas d 
      LEFT JOIN professores p ON d.professor_id = p.id 
      WHERE d.id = $1
    `;
    const discResult = await db.query(discQuery, [id]);

    if (discResult.rows.length === 0) {
      return res.status(404).json({ error: "Disciplina não encontrada." });
    }

    const d = discResult.rows[0];

    // CORREÇÃO: Leitura a partir da tabela 'notas' (mantendo o alias 'm' para estabilidade)
    const alunosQuery = `
      SELECT a.id, a.email, a.nome 
      FROM alunos a 
      INNER JOIN notas m ON a.id = m.aluno_id 
      WHERE m.disciplina_id = $1
    `;
    const alunosResult = await db.query(alunosQuery, [id]);

    const detalhes = {
      id: d.id,
      nome: d.nome,
      carga_horaria: d.carga_horaria,
      curso: d.curso,
      semestre: d.semestre,
      professor: d.prof_id ? { id: d.prof_id, nome: d.prof_nome } : null,
      alunos: alunosResult.rows,
    };

    res.json(detalhes);
  } catch (error) {
    console.error("[Erro] Detalhes da Disciplina:", error);
    res.status(500).json({ error: "Erro ao carregar detalhes." });
  }
};

// ==========================================
// ATRIBUIÇÕES E MATRÍCULAS
// ==========================================
exports.atribuirProfessor = async (req, res) => {
  const { id } = req.params;
  const { professorId } = req.body;

  try {
    await db.query("UPDATE disciplinas SET professor_id = $1 WHERE id = $2", [
      professorId,
      id,
    ]);
    res.json({ message: "Professor atribuído com sucesso." });
  } catch (error) {
    console.error("[Erro] Atribuir Professor:", error);
    res.status(500).json({ error: "Erro ao atribuir professor." });
  }
};

exports.matricularAluno = async (req, res) => {
  const { id } = req.params;
  const { alunoId } = req.body;

  try {
    // CORREÇÃO: Verificação na tabela 'notas'
    const check = await db.query(
      "SELECT * FROM notas WHERE aluno_id = $1 AND disciplina_id = $2",
      [alunoId, id],
    );
    if (check.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "O aluno já está matriculado nesta disciplina." });
    }

    // CORREÇÃO: Inserção na tabela 'notas'
    await db.query(
      "INSERT INTO notas (aluno_id, disciplina_id) VALUES ($1, $2)",
      [alunoId, id],
    );
    res.status(201).json({ message: "Aluno matriculado com sucesso." });
  } catch (error) {
    console.error("[Erro] Matricular Aluno:", error);
    res.status(500).json({ error: "Erro ao matricular aluno." });
  }
};

exports.atualizarAluno = async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    matricula,
    curso,
    email,
    telefone,
    cep,
    endereco,
    cidade,
    estado,
  } = req.body;

  try {
    const result = await db.query(
      "UPDATE alunos SET nome = $1, matricula = $2, curso = $3, email = $4, telefone = $5, cep = $6, endereco = $7, cidade = $8, estado = $9 WHERE id = $10 RETURNING *",
      [
        nome,
        matricula,
        curso,
        email,
        telefone,
        cep,
        endereco,
        cidade,
        estado,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    res.json({
      message: "Aluno atualizado com sucesso.",
      aluno: result.rows[0],
    });
  } catch (error) {
    console.error("[Erro] Atualizar Aluno:", error);
    res.status(500).json({ error: "Erro ao atualizar aluno." });
  }
};

exports.deletarAluno = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM alunos WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    res.json({ message: "Aluno excluído com sucesso." });
  } catch (error) {
    console.error("[Erro] Deletar Aluno:", error);
    res.status(500).json({ error: "Erro ao excluir aluno." });
  }
};

exports.removerAluno = async (req, res) => {
  const { id, alunoId } = req.params;

  try {
    // CORREÇÃO: Remoção da entrada correta na tabela 'notas'
    await db.query(
      "DELETE FROM notas WHERE aluno_id = $1 AND disciplina_id = $2",
      [alunoId, id],
    );
    res.json({ message: "Aluno removido da disciplina com sucesso." });
  } catch (error) {
    console.error("[Erro] Remover Aluno:", error);
    res.status(500).json({ error: "Erro ao remover aluno." });
  }
};

exports.atualizarProfessor = async (req, res) => {
  const { id } = req.params;
  const { nome, titulacao, area_atuacao, tempo_docencia, email } = req.body;

  try {
    const result = await db.query(
      "UPDATE professores SET nome = $1, titulacao = $2, area = $3, tempo_docencia = $4, email = $5 WHERE id = $6 RETURNING *",
      [nome, titulacao, area_atuacao, tempo_docencia, email, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Professor não encontrado." });
    }

    res.json({
      message: "Professor atualizado com sucesso.",
      professor: result.rows[0],
    });
  } catch (error) {
    console.error("[Erro] Atualizar Professor:", error);
    res.status(500).json({ error: "Erro ao atualizar professor." });
  }
};

exports.criarAluno = async (req, res) => {
  const {
    nome,
    matricula,
    curso,
    email,
    telefone,
    cep,
    endereco,
    cidade,
    estado,
  } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO alunos (nome, matricula, curso, email, telefone, cep, endereco, cidade, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [nome, matricula, curso, email, telefone, cep, endereco, cidade, estado],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("[Erro] Criar Aluno:", error);
    res.status(500).json({ error: "Erro ao criar aluno." });
  }
};

exports.criarProfessor = async (req, res) => {
  const { nome, titulacao, area_atuacao, tempo_docencia, email } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO professores (nome, titulacao, area, tempo_docencia, email) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, titulacao, area_atuacao, tempo_docencia, email],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("[Erro] Criar Professor:", error);
    res.status(500).json({ error: "Erro ao criar professor." });
  }
};

exports.deletarProfessor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM professores WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Professor não encontrado." });
    }

    res.json({ message: "Professor excluído com sucesso." });
  } catch (error) {
    console.error("[Erro] Deletar Professor:", error);
    res.status(500).json({ error: "Erro ao excluir professor." });
  }
};

// ==========================================
// PERFIL DO ALUNO (MEU PERFIL)
// ==========================================
exports.getMeuPerfil = async (req, res) => {
  const { email } = req.params;
  try {
    const result = await db.query("SELECT * FROM alunos WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Perfil não encontrado." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("[Erro] Buscar Perfil:", error);
    res.status(500).json({ error: "Erro ao carregar perfil." });
  }
};

exports.updateMeuPerfil = async (req, res) => {
  const { emailAtual } = req.params;
  const { email, senha, telefone, cep, endereco, cidade, estado } = req.body;

  try {
    // 1. Atualizar a tabela de Alunos (dados demográficos)
    await db.query(
      "UPDATE alunos SET email = $1, telefone = $2, cep = $3, endereco = $4, cidade = $5, estado = $6 WHERE email = $7",
      [email, telefone, cep, endereco, cidade, estado, emailAtual],
    );

    // 2. Atualizar a tabela de Usuários (credenciais de login)
    if (senha && senha.trim() !== "") {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(senha, saltRounds);
      await db.query(
        "UPDATE usuarios SET email = $1, senha = $2 WHERE email = $3",
        [email, hashedPassword, emailAtual],
      );
    } else {
      await db.query("UPDATE usuarios SET email = $1 WHERE email = $2", [
        email,
        emailAtual,
      ]);
    }

    res.json({ message: "Perfil atualizado com sucesso." });
  } catch (error) {
    console.error("[Erro] Atualizar Perfil:", error);
    // Se o erro for de duplicação de email na base de dados
    if (error.code === "23505") {
      return res.status(400).json({
        error: "Este e-mail já está a ser utilizado por outra conta.",
      });
    }
    res.status(500).json({ error: "Erro interno ao atualizar perfil." });
  }
};

// ==========================================
// PERFIL DO PROFESSOR (MEU PERFIL)
// ==========================================
exports.getMeuPerfilProfessor = async (req, res) => {
  const { email } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM professores WHERE email = $1",
      [email],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Perfil não encontrado." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("[Erro] Buscar Perfil Professor:", error);
    res.status(500).json({ error: "Erro ao carregar perfil." });
  }
};

exports.updateMeuPerfilProfessor = async (req, res) => {
  const { emailAtual } = req.params;
  const { email, senha, tempo_docencia } = req.body;

  try {
    // 1. Atualiza a tabela de Professores
    await db.query(
      "UPDATE professores SET email = $1, tempo_docencia = $2 WHERE email = $3",
      [email, tempo_docencia, emailAtual],
    );

    // 2. Atualiza a tabela de Usuários (credenciais)
    if (senha && senha.trim() !== "") {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(senha, saltRounds);
      await db.query(
        "UPDATE usuarios SET email = $1, senha = $2 WHERE email = $3",
        [email, hashedPassword, emailAtual],
      );
    } else {
      await db.query("UPDATE usuarios SET email = $1 WHERE email = $2", [
        email,
        emailAtual,
      ]);
    }

    res.json({ message: "Perfil atualizado com sucesso." });
  } catch (error) {
    console.error("[Erro] Atualizar Perfil Professor:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Este e-mail já está em uso." });
    }
    res.status(500).json({ error: "Erro interno ao atualizar perfil." });
  }
};
