-- ========================================================
-- Script de Inicialização da Base de Dados - App Scholar
-- ========================================================

-- 1. Criação da tabela de Usuários (Autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) NOT NULL
);

-- 2. Criação da tabela de Alunos
CREATE TABLE IF NOT EXISTS alunos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  matricula VARCHAR(50) UNIQUE NOT NULL,
  curso VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cep VARCHAR(20),
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  estado VARCHAR(2)
);

-- 3. Criação da tabela de Professores
CREATE TABLE IF NOT EXISTS professores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  titulacao VARCHAR(100),
  area VARCHAR(100),
  tempo_docencia VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL
);

-- 4. Criação da tabela de Disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  carga_horaria INTEGER NOT NULL,
  curso VARCHAR(100),
  semestre VARCHAR(50),
  professor_id INTEGER REFERENCES professores(id) ON DELETE SET NULL
);

-- 5. Criação da tabela de Notas
CREATE TABLE IF NOT EXISTS notas (
  id SERIAL PRIMARY KEY,
  aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
  disciplina_id INTEGER REFERENCES disciplinas(id) ON DELETE CASCADE,
  nota1 NUMERIC(5,2),
  nota2 NUMERIC(5,2),
  media NUMERIC(5,2),
  situacao VARCHAR(50) DEFAULT 'Cursando'
);


-- ========================================================
-- INSERÇÃO DE DADOS DE TESTE (MOCK DATA)
-- ========================================================

-- Inserir Usuários (A senha para todos é: 123456)
-- O hash utilizado abaixo é o padrão Bcrypt para "123456" com 10 salt rounds.
INSERT INTO usuarios (email, senha, perfil) VALUES 
('admin@scholar.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'ADMIN'),
('andre.olimpio@scholar.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'PROFESSOR'),
('aluno@scholar.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'ALUNO')
ON CONFLICT (email) DO NOTHING;

-- Inserir Professores
INSERT INTO professores (nome, titulacao, area, tempo_docencia, email) VALUES 
('André Olímpio', 'Mestre', 'Desenvolvimento Mobile', '10 anos', 'andre.olimpio@scholar.com'),
('Maria Silva', 'Doutora', 'Banco de Dados', '15 anos', 'maria.silva@scholar.com')
ON CONFLICT (email) DO NOTHING;

-- Inserir Alunos
INSERT INTO alunos (nome, matricula, curso, email, telefone, cep, endereco, cidade, estado) VALUES 
('João Carlos', '123456', 'DSM', 'aluno@scholar.com', '12999999999', '12245000', 'Avenida Principal', 'São José dos Campos', 'SP'),
('Ana Paula', '654321', 'DSM', 'ana.paula@scholar.com', '12888888888', '12300000', 'Rua Secundária', 'Jacareí', 'SP')
ON CONFLICT (email) DO NOTHING;

-- Inserir Disciplinas
INSERT INTO disciplinas (nome, carga_horaria, curso, semestre, professor_id) VALUES 
('Programação para Dispositivos Móveis I', 80, 'DSM', '3º Semestre', 1),
('Banco de Dados Relacional', 80, 'DSM', '2º Semestre', 2);

-- Matricular Alunos (Tabela notas)
INSERT INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao) VALUES 
(1, 1, 8.5, 9.0, 8.75, 'Aprovado'),
(1, 2, NULL, NULL, NULL, 'Cursando'),
(2, 1, 5.0, 4.0, 4.50, 'Reprovado');