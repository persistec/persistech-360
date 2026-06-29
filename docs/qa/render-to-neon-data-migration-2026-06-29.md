# Relatório de Migração: Render -> Neon (Data-Only)

**Data:** 2026-06-29
**Estado:** Migração de dados para a produção em Neon concluída com sucesso. Pronto para switch-over.

## 1. Informações de Execução (Fases 1 a 5)
- **Timestamp do Dump de Produção:** 2026-06-29 13:01 (UTC+1)
- **Ficheiro de Dump:** `render-data-production.dump` (5719 bytes, format=custom, data-only, sem `_prisma_migrations`).
- **Target Database:** Neon Production (`persistech-360` no host `ep-morning-wave-aciutlo4-pooler.sa-east-1.aws.neon.tech`).
- **Validação de Vazio:** Confirmou-se que a Neon Production estava 100% vazia (contagem de todas as 14 tabelas operacionais retornou rigorosamente `0`) antes da importação.
- **Execução do Restore:** O `pg_restore` decorreu sob transação única (`--single-transaction`) e completou sem erros.

## 2. Contagens e Reconciliação (Fase 6)

| Tabela | Render Source (Final) | Neon Production (Pós-Restore) | Estado |
|---|---|---|---|
| **users** | 1 | 1 | **Reconciliado (OK)** |
| **departments** | 1 | 1 | **Reconciliado (OK)** |
| **hierarchy_levels** | 0 | 0 | **Reconciliado (OK)** |
| **roles** | 0 | 0 | **Reconciliado (OK)** |
| **cycles** | 0 | 0 | **Reconciliado (OK)** |
| **dimensions** | 0 | 0 | **Reconciliado (OK)** |
| **criteria** | 0 | 0 | **Reconciliado (OK)** |
| **criterion_options** | 0 | 0 | **Reconciliado (OK)** |
| **applicability_rules** | 0 | 0 | **Reconciliado (OK)** |
| **weight_rules** | 0 | 0 | **Reconciliado (OK)** |
| **retention_policies** | 0 | 0 | **Reconciliado (OK)** |
| **evaluation_assignments**| 0 | 0 | **Reconciliado (OK)** |
| **evaluation_submissions**| 0 | 0 | **Reconciliado (OK)** |
| **evaluation_answers** | 0 | 0 | **Reconciliado (OK)** |
| **_prisma_migrations** | 0 | 0 | **Reconciliado (OK)** |

**Detalhamento de Users:**
- Total: 1
- App Roles: `ADMIN: 1`
- Status: `ACTIVE: 1`

## 3. Resultado do Smoke Test Local (Fase 7)
Com a API NestJS local temporariamente apontada para a base **Neon Production**:
- **GET /api/v1/health:** `{"status":"UP","timestamp":"...","database":"UP"}` (A base de produção responde com total sucesso).
- **GET /api/v1/departments:** Retornou a lista contendo o departamento `"Comercial"` importado (ID original: `f08b4516-bd1c-470c-a756-dccf1d09b937`).

## 4. Estado dos Ambientes
- **Render Source:** A base de dados antiga no Render continua intacta e funcional para salvaguarda/backup.
- **Render App:** A `DATABASE_URL` no serviço de alojamento da Render **ainda NÃO foi alterada**. A API antiga continua em execução sob a base de dados original.
- **Seed Estrutural:** O seed estrutural (`npx prisma db seed`) **NÃO foi executado** em Neon Production.

## 5. Próximos Passos (Switch-over)
Uma vez concluída a migração de dados com sucesso e sem perda de registos, o processo está pronto para a fase de switch-over:
1. Obter autorização explícita para alterar a `DATABASE_URL` no Render para apontar para a Neon Production.
2. Monitorizar o redeploy da API no Render.
3. Executar o smoke test HTTP remoto contra a API em produção para certificar o funcionamento.
4. Planear a execução controlada do seed estrutural real em produção para popular as tabelas auxiliares (`hierarchy_levels`, `roles`, etc.).
