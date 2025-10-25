# 🌾 API de Classificação de Grãos

API RESTful desenvolvida em Node.js para gerenciamento e autenticação de um sistema de classificação de grãos que utiliza processamento de imagem através de OpenCV.

## 📖 Sobre o Projeto

Esta API serve como backend para um aplicativo de classificação de grãos. Ela gerencia usuários, autenticação, histórico de análises e se comunica com uma API Python que realiza o processamento de imagens utilizando OpenCV para classificar a qualidade dos grãos.

**Principais funcionalidades:**
- Autenticação segura com JWT
- Cadastro e gerenciamento de usuários
- Upload e processamento de imagens de grãos
- Integração com API de análise em Python/OpenCV
- Histórico de análises realizadas

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Supabase** - Banco de dados e storage
- **Zod** - Validação de dados
- **JWT (jsonwebtoken)** - Autenticação
- **Axios** - Comunicação HTTP com API Python

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Conta no Supabase
- API Python de análise em execução

### Passo a passo

1. **Clone o repositório:**
```bash
git clone https://github.com/UBNoneCoders/classgrao-api-node.git
cd classgrao-api-node
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto:

4. **Execute a aplicação:**

Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm start
```

A API estará disponível em `http://localhost:3000`

## 👥 Integrantes
- [Matheus Augusto Silva dos Santos](https://github.com/Matheuz233)
- [Luan Jacomini Klho](https://github.com/luanklo)
- [Guilherme Felipe Mendonça](https://github.com/guilherme-felipe123)
