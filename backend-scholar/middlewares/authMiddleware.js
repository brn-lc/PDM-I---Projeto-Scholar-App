const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ error: "Erro no formato do token." });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Token mal formatado." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("[Segurança] CRÍTICO: JWT_SECRET não está definido no .env!");
    return res
      .status(500)
      .json({ error: "Erro interno de configuração do servidor." });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    // Anexa as informações do usuário à requisição para uso nos controllers
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    return next();
  });
};
