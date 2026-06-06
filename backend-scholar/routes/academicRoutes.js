const express = require("express");
const router = express.Router();

// Importação dos Controladores
const academicController = require("../controllers/academicController");
const gradeController = require("../controllers/gradeController");

// ==========================================
// ROTAS DE ALUNOS
// ==========================================
router.get("/alunos", academicController.listarAlunos);
router.post("/alunos", academicController.criarAluno);
router.put("/alunos/:id", academicController.atualizarAluno);
router.delete("/alunos/:id", academicController.deletarAluno);

// ==========================================
// ROTAS DE PROFESSORES
// ==========================================
router.get("/professores", academicController.listarProfessores);
router.post("/professores", academicController.criarProfessor);
router.put("/professores/:id", academicController.atualizarProfessor);
router.delete("/professores/:id", academicController.deletarProfessor);

// ==========================================
// ROTAS DE DISCIPLINAS
// ==========================================
router.get("/disciplinas", academicController.listarDisciplinas);
router.post("/disciplinas", academicController.criarDisciplina);
router.get("/disciplinas/:id/detalhes", academicController.detalhesDisciplina);
router.put("/disciplinas/:id", academicController.atualizarDisciplina);
router.delete("/disciplinas/:id", academicController.deletarDisciplina);

// ==========================================
// GESTÃO: ATRIBUIÇÕES E MATRÍCULAS
// ==========================================
router.put("/disciplinas/:id/professor", academicController.atribuirProfessor);
router.post("/disciplinas/:id/alunos", academicController.matricularAluno);
router.delete(
  "/disciplinas/:id/alunos/:alunoId",
  academicController.removerAluno,
);

// ==========================================
// GESTÃO DE NOTAS E BOLETIM
// ==========================================
router.get("/gestao-notas", gradeController.getGestaoNotas);
router.put("/gestao-notas", gradeController.updateNotasDaTurma);
router.get("/boletim/:matricula", gradeController.getBoletimAluno);

module.exports = router;
