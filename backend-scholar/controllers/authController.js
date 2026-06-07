const db = require("../database/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// --- REGISTO DE UTILIZADOR SEGURO ---
exports.register = async (req, res) => {
  const { email, password, perfil } = req.body;

  if (!email || !password || !perfil) {
    return res
      .status(400)
      .json({ error: "E-mail, senha e perfil são obrigatórios." });
  }

  try {
    // 1. Verificar se o utilizador já existe
    const checkUser = await db.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email],
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Este e-mail já está em uso." });
    }

    // 2. Gerar o Hash da palavra-passe (Salt round: 10 é o padrão seguro na indústria)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Inserir na base de dados
    const result = await db.query(
      "INSERT INTO usuarios (email, senha, perfil) VALUES ($1, $2, $3) RETURNING id, email, perfil",
      [email, hashedPassword, perfil],
    );

    res.status(201).json({
      message: "Utilizador criado com sucesso.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("[Auth] Erro ao registar utilizador:", error.message);
    return res.status(500).json({ error: "Erro interno ao criar conta." });
  }
};

// --- LOGIN (Já estava bem estruturado, apenas tipificado e refinado) ---
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Verifica exatamente o que chegou ao backend
  console.log(`[Login] Tentativa de acesso. Email recebido: '${email}'`);

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [
      email.trim(),
    ]);

    if (result.rows.length === 0) {
      // 2. Se cair aqui, o e-mail não foi encontrado na tabela
      console.log("[Login] FALHA: E-mail não encontrado na base de dados.");
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const user = result.rows[0];
    console.log(
      `[Login] SUCESSO: Utilizador encontrado no banco (ID: ${user.id}). A comparar senha...`,
    );

    const senhaValida = await bcrypt.compare(password, user.senha);

    // 3. Verifica se a biblioteca bcrypt validou a senha
    console.log(
      `[Login] RESULTADO BCRYPT: A senha está correta? ${senhaValida}`,
    );

    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // O JWT_SECRET deve estar rigorosamente no ficheiro .env
    const secret =
      process.env.JWT_SECRET || "chave_secreta_padrao_mudar_em_producao";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.perfil },
      secret,
      { expiresIn: "8h" },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.email.split("@")[0],
        role: user.perfil,
      },
    });
  } catch (error) {
    console.error("[Auth] Erro interno no login:", error.message);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro interno no servidor." });
  }
};
