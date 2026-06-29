# Preparação para Migração: Render -> Neon (Data-Only)

**Data:** 2026-06-29
**Estado:** Pré-checks finais concluídos. A aguardar limpeza do ambiente de validação e confirmação da janela de inatividade.

## Ferramentas Validadas
- **pg_dump:** PostgreSQL 18.3 (Encontrado via `%ProgramFiles%\PostgreSQL\18\bin`)
- **pg_restore:** PostgreSQL 18.3
- **Ambiente Git:** Limpo (`.env.*`, `tmp/`, `*.dump` estão devidamente ignorados no `.gitignore`).

## Validação de Servidores e Contagens (Pré-Check Final)

| Origem Lógica | Host (Sanitizado) | Database | Versão PostgreSQL | Estado Conectividade |
|---|---|---|---|---|
| **Render Source** | `dpg-d8knoo0jo6nc73fp7dpg-a.virginia-postgres.render.com` | `persistech_360_db` | `PostgreSQL 18.4` | Acessível |
| **Neon Validation** | `ep-snowy-dew-acq45dn2-pooler.sa-east-1.aws.neon.tech` | `persistech-360` | `PostgreSQL 18.4` | Acessível (Dados de testes presentes, necessita de reset) |
| **Neon Production**| `ep-morning-wave-aciutlo4-pooler.sa-east-1.aws.neon.tech` | `persistech-360` | `PostgreSQL 18.4` | Acessível (Vazio) |

### Contagens Globais e Comparação

| Tabela | Render Source (Finais) | Neon Validation (Pós-Restore) | Neon Production (Pós-Restore) |
|---|---|---|---|
| **users** | 1 | *Pendente* | *Pendente* |
| **departments** | 1 | *Pendente* | *Pendente* |
| **hierarchy_levels** | 0 | *Pendente* | *Pendente* |
| **roles** | 0 | *Pendente* | *Pendente* |
| **cycles** | 0 | *Pendente* | *Pendente* |
| **dimensions** | 0 | *Pendente* | *Pendente* |
| **criteria** | 0 | *Pendente* | *Pendente* |
| **criterion_options** | 0 | *Pendente* | *Pendente* |
| **applicability_rules** | 0 | *Pendente* | *Pendente* |
| **weight_rules** | 0 | *Pendente* | *Pendente* |
| **retention_policies** | 0 | *Pendente* | *Pendente* |
| **evaluation_assignments**| 0 | *Pendente* | *Pendente* |
| **evaluation_submissions**| 0 | *Pendente* | *Pendente* |
| **evaluation_answers** | 0 | *Pendente* | *Pendente* |

**User Breakdown (Render Source):**
- Total: 1
- App Roles: `ADMIN: 1`
- Status: `ACTIVE: 1`

### Status da Neon Validation
**Decisão:** A branch atual de validation do Neon contem dados residuais de testes locais prévios (1 user, 4 departments, 6 hierarchy levels, 5 roles).
Para garantir a integridade dos dados e um teste de restore limpo:
- **Não efetuaremos o restore por cima da branch atual.**
- **Opção A (Recomendada):** Criar uma nova branch descartável no Neon baseada em `production` (ex: `render-import-validation-20260629`) e reconfigurar `.env.neon-validation` com a nova string.
- **Opção B:** Resetar manualmente a branch atual para o estado inicial correspondente a `production` se autorizado.

### Decisão de Seed Estrutural
Como a Render Source possui tabelas estruturais de metadados vazias (ex: `hierarchy_levels`, `roles` e apenas 1 `department` e `user`), **será necessário executar o seed estrutural** (`npx prisma db seed`) após a importação final para criar a hierarquia e dados base no novo ambiente Neon. Este procedimento deve ser validado primeiro na branch descartável (Validation).

## Bloqueios Restantes antes do Dump Final
1. **Limpeza da Neon Validation** (via Opção A ou B) e atualização da connection string correspondente.
2. **Janela Sem Escritas:** Confirmar que a aplicação original está sem tráfego de escritas e autorizada a exportação.
3. **Autorização explícita** para o dump final.
