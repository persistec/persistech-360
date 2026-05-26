
# Arquitetura

## Visão geral

O sistema é uma plataforma interna de avaliação 360º adaptada.

Ele permite a execução de ciclos periódicos nos quais colaboradores elegíveis avaliam outros colaboradores elegíveis usando perguntas estruturadas, regras de aplicabilidade e cálculo ponderado.

O sistema deve impor:

- ausência de autoavaliação;
- bloqueio de avaliação de superiores hierárquicos;
- perguntas dinâmicas conforme relação e departamento;
- scoring ponderado por relação, departamento e categoria;
- anonimato funcional para o avaliado;
- acesso completo apenas para administradores autorizados;
- auditoria;
- retenção e controlo de exportação.

## Arquitetura física

```text
apps/web  -> frontend Next.js
apps/api  -> backend NestJS
database  -> PostgreSQL
````

O frontend e o backend vivem no mesmo repositório GitHub, mas são tratados como aplicações independentes.

Não existe pacote partilhado entre frontend e backend durante o MVP.

## Arquitetura em runtime

```text
Browser
  ↓
Next.js frontend
  ↓ HTTP API
NestJS backend
  ↓
PostgreSQL
```

O backend é dono do domínio. O frontend consome decisões do backend.

## Módulos principais do backend

Módulos NestJS recomendados:

```text
auth
users
departments
roles
cycles
assignments
evaluations
criteria
rules
scoring
reports
notifications
audit
retention
google-workspace
```

## Motores internos

O backend deve possuir três motores explícitos e testáveis.

### Motor de elegibilidade

Decide quem pode avaliar quem.

Exemplos:

* colaborador não pode avaliar a si próprio;
* colaborador não pode avaliar superior hierárquico;
* gestor pode avaliar subordinado;
* colega de mesmo nível pode avaliar outro colega, se elegível;
* colaboração interdepartamental pode permitir avaliação limitada.

### Motor de aplicabilidade

Decide quais categorias e perguntas aparecem para um par avaliador/avaliado.

Exemplos:

* colaborador comercial pode avaliar colaborador de TI em colaboração e comunicação;
* colaborador comercial não deve avaliar competência técnica de TI;
* perguntas departamentais só aparecem quando o avaliador possui contexto suficiente.

### Motor de ponderação

Calcula resultados consolidados considerando:

* peso da relação;
* peso da categoria;
* peso da pergunta;
* departamento do avaliador;
* departamento do avaliado;
* tipo de relação.

## Modelo de implantação

Durante o MVP:

* `apps/web` é implantado como um projeto Vercel;
* `apps/api` é implantado como outro projeto Vercel;
* deployments são controlados por GitHub Actions.

Após aprovação do MVP:

* migrar para self-hosted deployment;
* manter frontend e backend implantáveis separadamente.

## Princípio de desenho

Preferir módulos explícitos, testáveis e documentados no backend.

Este sistema lida com dados sensíveis de avaliação de pessoas. Não deve ser tratado como uma aplicação simples de formulários com dashboard decorativo.

