# Preparação para Migração: Render -> Neon (Data-Only)

**Data:** 2026-06-29
**Estado:** Nova validation branch confirmada e limpa. A aguardar confirmação da janela de inatividade para iniciar o dump.

## Ferramentas Validadas
- **pg_dump:** PostgreSQL 18.3 (Encontrado via `%ProgramFiles%\PostgreSQL\18\bin`)
- **pg_restore:** PostgreSQL 18.3
- **Ambiente Git:** Limpo (`.env.*`, `tmp/`, `*.dump` estão devidamente ignorados no `.gitignore`).

## Validação de Servidores e Contagens (Pré-Check Final)

| Origem Lógica | Host (Sanitizado) | Database | Versão PostgreSQL | Estado Conectividade |
|---|---|---|---|---|
| **Render Source** | `dpg-d8knoo0jo6nc73fp7dpg-a.virginia-postgres.render.com` | `persistech_360_db` | `PostgreSQL 18.4` | Acessível |
| **Neon Validation** | `ep-proud-block-ac6syq6s-pooler.sa-east-1.aws.neon.tech` | `persistech-360` | `PostgreSQL 18.4` | Acessível (Limpo/Vazio) |
| **Neon Production**| `ep-morning-wave-aciutlo4-pooler.sa-east-1.aws.neon.tech` | `persistech-360` | `PostgreSQL 18.4` | Acessível (Limpo/Vazio) |

### Contagens Globais e Comparação

| Tabela | Render Source (Finais) | Neon Validation (`new-neon-validation`) | Neon Production (Pós-Restore) |
|---|---|---|---|
| **users** | 1 | 0 | *Pendente* |
| **departments** | 1 | 0 | *Pendente* |
| **hierarchy_levels** | 0 | 0 | *Pendente* |
| **roles** | 0 | 0 | *Pendente* |
| **cycles** | 0 | 0 | *Pendente* |
| **dimensions** | 0 | 0 | *Pendente* |
| **criteria** | 0 | 0 | *Pendente* |
| **criterion_options** | 0 | 0 | *Pendente* |
| **applicability_rules** | 0 | 0 | *Pendente* |
| **weight_rules** | 0 | 0 | *Pendente* |
| **retention_policies** | 0 | 0 | *Pendente* |
| **evaluation_assignments**| 0 | 0 | *Pendente* |
| **evaluation_submissions**| 0 | 0 | *Pendente* |
| **evaluation_answers** | 0 | 0 | *Pendente* |
| **_prisma_migrations** | - | 0 | *Pendente* |

**User Breakdown (Render Source):**
- Total: 1
- App Roles: `ADMIN: 1`
- Status: `ACTIVE: 1`

### Status da Neon Validation (new-neon-validation)
- **Decisão:** Opção A implementada. Foi criada uma nova branch descartável no Neon designada `new-neon-validation` a partir de `production`, com a opção **Schema only**.
- **Esquema:** Confirmou-se que todas as 14 tabelas operacionais existem e foram mapeadas com sucesso.
- **Limpeza:** Todas as tabelas operacionais retornaram a contagem de `0`.
- **Histórico Prisma:** A tabela `_prisma_migrations` encontra-se a `0` (vazia), o que é expectável dado que a branch foi criada sem cópia de dados. Como o objetivo desta branch é estritamente testar e validar o restore em formato *data-only*, este estado está correto e a branch está **pronta para receber o restauro**.

### Decisão de Seed Estrutural
Como a Render Source possui tabelas estruturais de metadados vazias (ex: `hierarchy_levels`, `roles` e apenas 1 `department` e `user`), **será necessário executar o seed estrutural** (`npx prisma db seed`) após a importação final para criar a hierarquia e dados base no novo ambiente Neon. Este procedimento deve ser validado primeiro na branch descartável (Validation).

## Bloqueios Restantes antes do Dump Final
1. **Janela Sem Escritas:** Confirmar que a aplicação original está sem tráfego de escritas e autorizada a exportação.
2. **Autorização explícita** do utilizador.
