# Persistech 360

Sistema interno de avaliação 360º adaptada para ciclos periódicos de avaliação de colaboradores.

## Objetivo

Permitir que colaboradores elegíveis avaliem outros colaboradores elegíveis com base em critérios estruturados, regras de hierarquia, categorias aplicáveis e cálculo ponderado.

Este sistema não é uma plataforma de votação.

## Stack

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- CI/CD: GitHub Actions
- Hospedagem provisória: Vercel
- Hospedagem final: self-hosted deployment após aprovação do MVP

## Estrutura

```text
persistech-360/
├── apps/
│   ├── web/      # Frontend Next.js
│   └── api/      # Backend NestJS
├── docs/
├── scripts/
└── .github/workflows/
```

## Desenvolvimento local

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

Backend (requer subir o PostgreSQL local via Docker na porta 5433 primeiro):

```bash
# Na raiz do repositório
docker compose up -d

# Na pasta da API
cd apps/api
npm install
npm run start:dev
```

URLs locais:

```text
Frontend: http://localhost:3000
Backend API / Swagger: http://localhost:4000/docs
Health: http://localhost:4000/api/v1/health
```

## Documentação

Consultar primeiro:

- `AGENTS.md`
- `docs/architecture.md`
- `docs/business-rules.md`
- `docs/domain-model.md`
- `docs/security-and-permissions.md`
- `docs/google-workspace-integration.md`
- `docs/api-contract.md`
- `docs/ci-cd.md`
- `docs/local-development.md`
- `docs/mvp-scope.md`
- `docs/open-decisions.md`

## Regra importante

Durante o MVP não haverá pacotes partilhados entre frontend e backend.

Não criar:

```text
packages/shared
packages/config
pnpm-workspace.yaml
```

A comunicação entre frontend e backend deve ocorrer por contrato HTTP versionado.

## Execução

Não executar `npm install` na raiz.

Executar dentro de cada aplicação:

```text
apps/web
apps/api
```

## Estado do projeto

Projeto em fase inicial de construção do MVP.
