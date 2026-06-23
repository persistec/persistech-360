# CI/CD

## Plataforma

CI/CD será feito com GitHub Actions.

A Vercel será usada como hospedagem provisória para o MVP.

Deploys automáticos nativos da Vercel não devem ser o mecanismo principal de implantação.

As validações devem usar npm dentro da aplicação afetada, com `npm ci` baseado no `package-lock.json` da própria app.

## Projetos de implantação

A API é implantada no Render via Webhook, e o Frontend na Vercel.

```text
apps/web -> projeto frontend na Vercel
apps/api -> projeto backend no Render
```

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

A aplicação web usa o seu `VERCEL_PROJECT_ID`. A aplicação API usa o webhook do Render.

## Tarefas agendadas

A Vercel Cron foi removida do caminho de deploy porque contas Hobby/free só suportam jobs diários.

O agendamento recorrente agora é feito por GitHub Actions com `schedule` e `workflow_dispatch`.

Variáveis e Secrets necessários para o agendamento:

```text
SCHEDULED_TASK_URL (GitHub: deve apontar para https://persistech-360.vercel.app/api/keep-render-awake)
SCHEDULED_TASK_SECRET (GitHub e Vercel: o mesmo secret para autenticação)
SCHEDULED_TASK_TIMEOUT_SECONDS (GitHub: controla o tempo máximo que o GitHub Actions aguarda pelo pedido HTTP agendado. Como o cold start do Render pode exceder 30s, o valor recomendado é 90)
RENDER_API_HEALTH_URL (Vercel: deve apontar para o health check do Render, ex: https://persistech-360-api.onrender.com/api/v1/health)
```

Nota: workflows agendados no GitHub só executam a partir da branch default depois de o ficheiro existir nessa branch.

## Secrets necessários

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
RENDER_API_DEPLOY_HOOK_URL
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
