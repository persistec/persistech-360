# Desenvolvimento local

## Requisitos

Instalar localmente:

- Node.js LTS;
- pnpm;
- Git;
- Docker Desktop ou runtime Docker compatível;
- cliente PostgreSQL opcional.

## Estrutura do repositório

```text
apps/web
apps/api
docs
scripts
.github/workflows
```

## Frontend

A aplicação frontend está em:

```text
apps/web
```

Para executar:

```bash
cd apps/web
pnpm install
pnpm dev
```

URL padrão:

```text
http://localhost:3000
```

## Backend

A aplicação backend está em:

```text
apps/api
```

Para executar:

```bash
cd apps/api
pnpm install
pnpm start:dev
```

URL padrão:

```text
http://localhost:4000
```

## Ficheiros de ambiente

Frontend:

```text
apps/web/.env.local
apps/web/.env.example
```

Backend:

```text
apps/api/.env
apps/api/.env.example
```

## Exemplo de `.env.example` do frontend

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Exemplo de `.env.example` do backend

```env
NODE_ENV=development
PORT=4000
WEB_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/persistech_360

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_WORKSPACE_DOMAIN=
```

## Base de dados

PostgreSQL será configurado com Docker Compose numa etapa posterior.

O backend é dono do acesso à base de dados.

O frontend nunca deve conectar diretamente ao banco.

## Execução simultânea

Usar dois terminais.

Terminal 1:

```bash
cd apps/web
pnpm dev
```

Terminal 2:

```bash
cd apps/api
pnpm start:dev
```

## Instalação de dependências

Não executar `pnpm install` na raiz nem em `apps/`, porque não estamos a usar workspace pnpm no MVP.

Executar sempre dentro de:

```text
apps/web
apps/api
```

## Sem workspace pnpm

Durante o MVP, não criar:

```text
pnpm-workspace.yaml
packages/shared
packages/config
```

A decisão é intencional para preservar implantação independente entre frontend e backend.

## Verificações locais

Frontend:

```bash
cd apps/web
pnpm lint
pnpm build
```

Backend:

```bash
cd apps/api
pnpm test
pnpm build
```

## Observação

A simplicidade aqui é deliberada. Cada aplicação deve poder ser instalada, validada e implantada isoladamente, sem precisar arrastar a outra como bagagem emocional de monorepo.
