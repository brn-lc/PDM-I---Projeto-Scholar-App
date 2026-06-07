# 📱 App Scholar - Gestão Académica

> Aplicativo Mobile de Gerenciamento de Boletim Acadêmico para Instituições de Graduação em Tecnologia.

Projeto desenvolvido como atividade avaliativa para a disciplina de **Programação para Dispositivos Móveis I**, ministrada pelo **Prof. André Olímpio** na **Fatec Jacareí - Centro Paula Souza**.

---

## 🎯 Visão Geral

O **App Scholar** é um sistema completo (Mobile + API) focado na gestão de informações académicas. Permite a autenticação segura de utilizadores, gestão de entidades (Alunos, Professores, Disciplinas) e um sistema completo de matrículas e lançamento de notas (Boletim).

## ✨ Funcionalidades Principais

- **Autenticação Segura (JWT):** Login com distinção de perfis (Aluno, Professor, Admin).
- **Gestão de Entidades (CRUD):** Registo e manutenção de Alunos, Professores e Disciplinas.
- **Sistema de Matrículas:** Associação de alunos a disciplinas e atribuição de professores.
- **Gestão de Notas (Boletim):** Lançamento de notas (N1, N2), cálculo automático da Média e definição da Situação (Aprovado/Reprovado/Cursando).
- **Integração de APIs Externas:**
  - **ViaCEP:** Preenchimento automático da morada através do CEP no registo de alunos.
  - **IBGE:** Listagem dinâmica em cascata de Estados (UF) e Cidades.

---

## 🛠️ Tecnologias Utilizadas

### Frontend (Mobile)

- **[React Native](https://reactnative.dev/)** & **[Expo](https://expo.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)** (Tipagem estática e segura)
- **[React Navigation](https://reactnavigation.org/)** (Navegação em stack)
- **[Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)** (Armazenamento local seguro para tokens)
- **[Axios](https://axios-http.com/)** (Consumo de APIs REST)

### Backend (API)

- **[Node.js](https://nodejs.org/)** & **[Express](https://expressjs.com/)**
- **[PostgreSQL](https://www.postgresql.org/)** (Base de dados relacional via pacote `pg`)
- **[JSON Web Tokens (JWT)](https://jwt.io/)** (Autenticação)
- **[Bcrypt](https://www.npmjs.com/package/bcrypt)** (Hashing de palavras-passe)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

Certifique-se de que tem instalado na sua máquina:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (com uma base de dados criada)
- Uma conta no [Expo](https://expo.dev/) / Aplicação Expo Go no telemóvel (opcional, para testes em dispositivo físico)

### 1. Configuração da Base de Dados e Backend

Abra a sua ferramenta de gestão do PostgreSQL (ex: pgAdmin, DBeaver ou psql) e crie uma base de dados chamada `scholar_db`.

Em seguida, execute o script de inicialização para criar as tabelas e popular a base com dados de teste. O script encontra-se em:
📂 `backend-scholar/database/init.sql`

**Contas de Teste Pré-Configuradas:**

- **Admin:** `admin@scholar.com`
- **Professor:** `andre.olimpio@scholar.com`
- **Aluno:** `aluno@scholar.com`
  > _A senha para todas as contas é: `123456`_

Após configurar a base de dados, crie um ficheiro `.env` na raiz da pasta `backend-scholar`.

```bash
# backend-scholar/.env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=scholar_db
DB_PASSWORD=sua_senha_aqui
DB_PORT=5432
JWT_SECRET=sua_chave_secreta_super_segura
```

Instale as dependências e inicie o servidor em modo de desenvolvimento:

```Bash
npm install
npm run dev
```

(A API deverá funcionar em http://localhost:3000)

### 2. Configuração do Frontend (Mobile)

Abra um novo terminal e navegue para a raiz do projeto mobile:

Na pasta raiz do projeto: Duplique o ficheiro .env.example, renomeie a cópia para .env e ajuste a variável com o IP da sua máquina.

**Aviso:** Não utilize localhost se for testar no telemóvel físico, utilize o IP local da sua rede (ex: 192.168.1.X).

```bash
# .env
EXPO_PUBLIC_API_URL=http://SEU_IP_DA_REDE:3000
```

Instale as dependências e inicie a aplicação:

```Bash
npm install
npx expo start
```

### 3. Testar a Aplicação

> Aperte _a_ no terminal do Expo para abrir no Emulador Android.

> Aperte _i_ para abrir no Simulador iOS.

Ou leia o QR Code com a aplicação Expo Go no seu dispositivo Android/iOS.

## 📚 Estrutura do Projeto (Frontend)

O frontend foi desenhado seguindo as melhores práticas de organização de código:

```
/src
 ├── /components     # Componentes reutilizáveis de UI (Botões, Inputs, Header)
 ├── /contexts       # Estado global da aplicação (AuthContext)
 ├── /hooks          # Hooks customizados (ex: useApi para chamadas com tratamento de erros)
 ├── /navigation     # Configuração de rotas e tipagens do React Navigation
 ├── /screens        # Ecrãs principais da aplicação
 ├── /services       # Serviços de integração (Axios, APIs externas, SecureStore)
 ├── /theme          # Design system (Cores, Espaçamentos, Tipografia)
 └── /utils          # Funções utilitárias (ex: AlertHelper multiplataforma)
```
