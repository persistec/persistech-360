# CI/CD

## Plataforma

CI/CD será feito com GitHub Actions.

A Vercel será usada como hospedagem provisória para o MVP.

Deploys automáticos nativos da Vercel não devem ser o mecanismo principal de implantação.

As validações devem usar npm dentro da aplicação afetada, com `npm ci` baseado no `package-lock.json` da própria app.

## Projetos de implantação

Existem dois projetos Vercel:

```text
apps/web -> projeto frontend
apps/api -> projeto backend
````

## Comportamento por caminhos alterados

### Alterações no frontend

Mudanças em:

```text
apps/web/**
```

Devem executar:

* instalar dependências do frontend;
* lint do frontend;
* testes do frontend, se disponíveis;
* build do frontend;
* deploy do frontend, se permitido pela regra da branch.

### Alterações no backend

Mudanças em:

```text
apps/api/**
```

Devem executar:

* instalar dependências do backend;
* lint do backend;
* testes do backend;
* build do backend;
* deploy do backend, se permitido pela regra da branch.

### Alterações em documentação

Mudanças em:

```text
docs/**
AGENTS.md
README.md
```

Devem executar apenas validação documental, se existir.

Não devem disparar deploy.

### Alterações em workflows

Mudanças em:

```text
.github/workflows/**
```

Exigem revisão cuidadosa.

Não devem disparar deploy automático por padrão.

## Sem pacotes partilhados

Não haverá:

```text
packages/shared
packages/config
```

Isto evita forçar rebuild dos dois projetos por mudança em pacote comum.

## Fluxo Vercel via GitHub Actions

Usar Vercel CLI:

```text
vercel pull
vercel build
vercel deploy --prebuilt
```

Cada aplicação usa o seu próprio `VERCEL_PROJECT_ID`.

## Secrets necessários

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID_WEB
VERCEL_PROJECT_ID_API
```

## Política de branches recomendada

* Pull requests: validação apenas.
* Branch principal: deploy para preview/staging.
* Produção provisória: deploy manual ou ambiente protegido.
* Produção final: a definir na fase self-hosted.

## Regras de deploy

### Pull request

Em pull requests:

* executar validações;
* não fazer deploy automático;
* publicar apenas resultado dos checks.

### Branch principal

Na branch principal:

* executar validações;
* fazer deploy seletivo apenas da aplicação afetada, se configurado;
* não fazer deploy de documentação.

### Produção

Produção deve exigir aprovação manual ou ambiente protegido.

Nada de “push e reza”, que é uma estratégia popular apenas entre pessoas que gostam de incidentes.

## Objetivo

Evitar consumo desnecessário de recursos e evitar que uma mudança pequena em documentação ou frontend reimplante o backend sem motivo.
