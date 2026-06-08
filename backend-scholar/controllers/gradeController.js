const db = require("../database/db");

// --- MATRÍCULA (Vinculada à tabela oficial de notas) ---
exports.enrollAluno = async (req, res) => {
  const { aluno_id, disciplina_id } = req.body;
  try {
    const result = await db.query(
      // Substituído para a tabela 'notas' exigida pelo padrão do projeto
      `INSERT INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao) 
       VALUES ($1, $2, null, null, null, 'Cursando') RETURNING *`,
      [aluno_id, disciplina_id],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "Erro ao realizar matrícula. Verifique se o aluno já está matriculado.",
    });
  }
};

// --- CONSULTA PARA O GESTOR (ADMIN/PROF) ---
exports.getGestaoNotas = async (req, res) => {
  try {
    // 1. Base da Query SQL (idêntica à original)
    let query = `
      SELECT 
        d.id as disciplina_id, d.nome as disciplina_nome, p.nome as professor_nome,
        m.id as matricula_id, a.nome as aluno_nome, a.matricula,
        m.nota1, m.nota2, m.media, m.situacao
      FROM disciplinas d
      LEFT JOIN professores p ON d.professor_id = p.id
      LEFT JOIN notas m ON d.id = m.disciplina_id
      LEFT JOIN alunos a ON m.aluno_id = a.id
    `;

    const queryParams = [];

    // 2. CONTROLE DE ACESSO: Se o perfil for PROFESSOR, filtra pelo e-mail do usuário logado
    // O req.userRole e req.userEmail vêm direto do token decodificado no authMiddleware
    if (req.userRole === "PROFESSOR") {
      query += ` WHERE p.email = $1 `;
      queryParams.push(req.userEmail);
    }

    // 3. Adiciona a ordenação padrão no final da string
    query += ` ORDER BY d.nome, a.nome `;

    const result = await db.query(query, queryParams);

    // 4. Mapeamento dos dados (permanece o mesmo para manter compatibilidade com o frontend)
    const disciplinas = {};
    result.rows.forEach((row) => {
      if (!disciplinas[row.disciplina_id]) {
        disciplinas[row.disciplina_id] = {
          id: row.disciplina_id.toString(),
          nome: row.disciplina_nome,
          professor: row.professor_nome || "Não atribuído",
          notas: [],
        };
      }
      if (row.matricula_id) {
        disciplinas[row.disciplina_id].notas.push({
          id: row.matricula_id.toString(),
          alunoNome: row.aluno_nome,
          matricula: row.matricula,
          nota1: row.nota1 || "",
          nota2: row.nota2 || "",
          media: row.media || "-",
          situacao: row.situacao || "Cursando",
        });
      }
    });

    res.json(Object.values(disciplinas));
  } catch (error) {
    console.error("[Erro] Buscar dados de gestão:", error);
    res.status(500).json({ error: "Erro ao buscar dados de gestão" });
  }
};

// --- CONSULTA DE BOLETIM PARA O ALUNO ---
exports.getBoletimAluno = async (req, res) => {
  const { matricula } = req.params;

  try {
    // Atualizámos o WHERE para procurar pela matrícula OU pelo e-mail
    const result = await db.query(
      `
      SELECT m.id, d.nome as disciplina, m.nota1, m.nota2, m.media, m.situacao
      FROM notas m
      JOIN disciplinas d ON m.disciplina_id = d.id
      JOIN alunos a ON m.aluno_id = a.id
      WHERE a.matricula = $1 OR a.email = $1
    `,
      [matricula],
    );

    const formatado = result.rows.map((r) => ({
      id: r.id.toString(),
      disciplina: r.disciplina,
      nota1: r.nota1 || "",
      nota2: r.nota2 || "",
      media: r.media || "-",
      situacao: r.situacao || "Cursando",
    }));

    res.json(formatado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar boletim" });
  }
};

// --- ATUALIZAR NOTAS DA TURMA ---
exports.updateNotasDaTurma = async (req, res) => {
  const { notas } = req.body;
  try {
    for (let nota of notas) {
      // Correção do Bug do Zero: Usa null apenas se estiver vazio de fato
      const vNota1 =
        nota.nota1 !== "" && nota.nota1 !== null && nota.nota1 !== undefined
          ? nota.nota1
          : null;
      const vNota2 =
        nota.nota2 !== "" && nota.nota2 !== null && nota.nota2 !== undefined
          ? nota.nota2
          : null;
      const vMedia =
        nota.media !== "" && nota.media !== "-" && nota.media !== null
          ? nota.media
          : null;

      await db.query(
        `UPDATE notas SET nota1 = $1, nota2 = $2, media = $3, situacao = $4 WHERE id = $5`,
        [vNota1, vNota2, vMedia, nota.situacao, nota.id],
      );
    }
    res.json({ message: "Notas salvas com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar notas" });
  }
};
