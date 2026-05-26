## Projeto

Persistech 360 é um sistema interno de avaliação 360º adaptada para ciclos periódicos de avaliação de colaboradores.

Este sistema não é uma plataforma de votação. É uma aplicação de avaliação estruturada, com regras de elegibilidade, hierarquia, aplicabilidade de categorias, cálculo ponderado, anonimato funcional, auditoria, retenção e controlo de exportação.

## Stack aprovada

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Base de dados: PostgreSQL
- ORM e migrations: Prisma
- Gestão de dependências: npm, sem workspaces
- CI/CD: GitHub Actions
- Hospedagem provisória: Vercel
- Hospedagem final: self-hosted deployment após aprovação do MVP

## Estrutura do repositório

```text
persistech-360/
├── apps/
│   ├── web/      # Frontend Next.js
│   └── api/      # Backend NestJS
├── docs/
├── scripts/
└── .github/workflows/
````

Durante o MVP não devem existir:

```text
packages/shared/
packages/config/
```

Frontend e backend devem permanecer instaláveis, testáveis, compiláveis e implantáveis de forma independente.

## Regras obrigatórias para agentes

1. Não criar pacotes partilhados sem aprovação explícita.
2. Não importar tipos do backend diretamente no frontend.
3. Não mover regras de negócio sensíveis para o frontend.
4. Não implementar autorização apenas no frontend.
5. Não criar funcionalidade de autoavaliação.
6. Não permitir que colaboradores avaliem superiores hierárquicos.
7. Não tratar o sistema como uma plataforma genérica de votação.
8. Não alterar frontend, backend e CI/CD no mesmo trabalho sem necessidade real.
9. Toda alteração em regra de backend deve incluir ou atualizar testes.
10. Toda alteração de regra de domínio deve atualizar a documentação correspondente em `docs/`.

## Fonte de verdade documental

* Arquitetura: `docs/architecture.md`
* Regras de negócio: `docs/business-rules.md`
* Modelo de domínio: `docs/domain-model.md`
* Segurança e permissões: `docs/security-and-permissions.md`
* Integração Google Workspace: `docs/google-workspace-integration.md`
* Contrato da API: `docs/api-contract.md`
* CI/CD: `docs/ci-cd.md`
* Desenvolvimento local: `docs/local-development.md`
* Escopo do MVP: `docs/mvp-scope.md`
* Decisões em aberto: `docs/open-decisions.md`

## Responsabilidades do frontend

O frontend é responsável por:

* interface do utilizador;
* dashboards;
* formulários;
* apresentação dos dados retornados pela API;
* validações auxiliares de experiência;
* chamadas à API backend;
* gestão local de estado.

O frontend não é fonte de verdade para:

* permissões;
* elegibilidade;
* pesos;
* scoring;
* restrições hierárquicas;
* auditoria;
* retenção;
* exportação.

## Responsabilidades do backend

O backend é a fonte de verdade para:

* validação de autenticação;
* autorização;
* RBAC;
* ciclos de avaliação;
* motor de elegibilidade;
* motor de aplicabilidade;
* motor de ponderação;
* auditoria;
* retenção;
* exportações;
* integração Google Workspace;
* notificações;
* persistência.

## Contrato da API

Frontend e backend comunicam por uma API HTTP versionada.

O backend deve expor documentação OpenAPI/Swagger.

O frontend pode manter tipos locais ou gerar um cliente local a partir do contrato da API, mas não deve importar ficheiros fonte do backend diretamente.

## Regra de implantação

A implantação deve ser seletiva:

* mudanças em `apps/web` afetam apenas o frontend;
* mudanças em `apps/api` afetam apenas o backend;
* mudanças em `docs` não disparam deploy;
* mudanças em CI/CD exigem revisão cuidadosa;
* deploy automático nativo da Vercel não deve ser o mecanismo principal de CI/CD.

