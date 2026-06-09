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

Agora é possível executar os três serviços em containers separados com Docker Compose na raiz do repositório:

```bash
docker compose up --build -d
```

Isso levanta:

- `postgres` como base de dados PostgreSQL;
- `api` como aplicação NestJS em `http://localhost:4000`;
- `web` como aplicação Next.js em `http://localhost:3000`.

URLs locais:

```text
Frontend: http://localhost:3000
Backend API / Swagger: http://localhost:4000/docs
Health: http://localhost:4000/api/v1/health
```

Rede local:

- O host liga-se ao PostgreSQL em `localhost:5433`.
- O container `api` liga-se ao PostgreSQL em `postgres:5432`.
- O browser chama a API em `http://localhost:4000`.
- Não usar IPs de containers nem substituir o nome de serviço `postgres`.
- Não usar `localhost:5433` dentro do container da API.
- Não combinar `postgres`, `api` e `web` num único container.

Para migrações e seed no contexto Docker:

```bash
docker compose exec api npx prisma migrate dev
docker compose exec api npx prisma db seed
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
- `docs/environment-networking.md`
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
