const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rotas de Autenticação e Gestão de Contas
router.post("/login", authController.login);
router.post("/register", authController.register); // Nova rota segura para criação de utilizadores

module.exports = router;
