# Desenvolvimento local

## Requisitos

Instalar localmente:

- Node.js LTS;
- npm;
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
npm install
npm run dev
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
npm install
npm run start:dev
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

DATABASE_URL=postgresql://postgres:postgres@localhost:5433/persistech_360

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_WORKSPACE_DOMAIN=
```

## Base de dados

O local da base de dados PostgreSQL é gerido via Docker Compose na raiz do repositório:

```bash
docker compose up -d
```

Isto iniciará uma base de dados PostgreSQL local com as seguintes credenciais (definidas no `docker-compose.yml` e `.env`):
- **Database**: `persistech_360`
- **User**: `postgres`
- **Password**: `postgres`
- **Porta**: `5433` (mapeada para a porta interna 5432 para evitar conflito com PostgreSQL nativo da máquina local na porta 5432)

O backend é dono do acesso à base de dados. O frontend nunca deve conectar diretamente ao banco.

### Execução de comandos do Prisma

Antes de iniciar a API pela primeira vez ou após alterações de schema, execute os seguintes comandos a partir da pasta `apps/api`:

1. Aplicar migrações da base de dados:
```bash
npx prisma migrate dev
```

2. Popular a base de dados com o seed inicial:
```bash
npx prisma db seed
```

3. Gerar cliente do Prisma (geralmente automático no `migrate dev` ou `npm install`):
```bash
npx prisma generate
```

## Execução simultânea

Usar dois terminais.

Terminal 1:

```bash
cd apps/web
npm run dev
```

Terminal 2:

```bash
cd apps/api
npm run start:dev
```

## Instalação de dependências

Não executar `npm install` na raiz. Cada aplicação deve instalar dependências no seu próprio diretório, porque não estamos a usar workspace npm no MVP.

Executar sempre dentro de:

```text
apps/web
apps/api
```

## Sem workspace npm

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
npm run lint
npm run build
```

Backend:

```bash
cd apps/api
npm run lint
npm test
npm run build
```

## Observação

A simplicidade aqui é deliberada. Cada aplicação deve poder ser instalada, validada e implantada isoladamente, sem precisar arrastar a outra como bagagem emocional de monorepo.
