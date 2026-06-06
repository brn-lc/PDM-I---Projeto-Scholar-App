const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Importando as rotas
const authRoutes = require("./routes/authRoutes");
const academicRoutes = require("./routes/academicRoutes");

// Usando as rotas
app.use("/api", authRoutes);
app.use("/api", academicRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
