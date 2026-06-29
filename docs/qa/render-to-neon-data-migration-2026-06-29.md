# Relatório de Migração: Render -> Neon (Data-Only)

**Data:** 2026-06-29
**Estado:** Migração concluída. Switch-over executado. API em produção a ler da Neon Production.

## 1. Resumo da Operação
A base de dados operacional do projecto Persistech 360 foi migrada com sucesso da instância PostgreSQL alojada no Render para a instância Neon Production, sem perda de dados e sem downtime significativo.

## 2. Cronologia

| Hora (UTC+1) | Evento |
|---|---|
| ~12:38 | Dump data-only validado em sandbox (`new-neon-validation`) |
| ~13:01 | Dump data-only final para Neon Production |
| ~13:03 | Restore em Neon Production concluído e reconciliado |
| ~13:04 | Smoke local contra Neon Production bem-sucedido |
| ~14:30 | Pré-check switch-over: Render Source vs Neon Production reconciliados |
| ~15:13 | Switch-over manual: `DATABASE_URL` da Render actualizada para Neon Production |
| ~15:15 | Smoke HTTP remoto contra API pública em produção bem-sucedido |

## 3. Contagens Finais Reconciliadas (Render Source vs Neon Production)

| Tabela | Render Source | Neon Production | Estado |
|---|---|---|---|
| **users** | 1 | 1 | **MATCH** |
| **departments** | 1 | 1 | **MATCH** |
| **hierarchy_levels** | 0 | 0 | **MATCH** |
| **roles** | 0 | 0 | **MATCH** |
| **cycles** | 0 | 0 | **MATCH** |
| **dimensions** | 0 | 0 | **MATCH** |
| **criteria** | 0 | 0 | **MATCH** |
| **criterion_options** | 0 | 0 | **MATCH** |
| **applicability_rules** | 0 | 0 | **MATCH** |
| **weight_rules** | 0 | 0 | **MATCH** |
| **retention_policies** | 0 | 0 | **MATCH** |
| **evaluation_assignments** | 0 | 0 | **MATCH** |
| **evaluation_submissions** | 0 | 0 | **MATCH** |
| **evaluation_answers** | 0 | 0 | **MATCH** |

**User Breakdown:** 1 utilizador `ACTIVE` com `app_role = ADMIN`.

## 4. Smoke HTTP em Produção (Fase 4-5)

**GET /api/v1/health:**
```json
{"status":"UP","timestamp":"2026-06-29T14:15:51.767Z","database":"UP"}
```

**GET /api/v1/departments:**
```json
[{"id":"f08b4516-bd1c-470c-a756-dccf1d09b937","name":"Comercial","parentDepartmentId":null,"createdAt":"2026-06-26T12:47:48.193Z","updatedAt":"2026-06-26T12:47:48.193Z"}]
```

**Verificação Fase 5:** O ID do departamento retornado (`f08b4516-bd1c-470c-a756-dccf1d09b937`) corresponde exactamente ao ID original importado da Render Source, confirmando que a API pública está a ler dados da Neon Production.

## 5. Estado dos Ambientes

| Ambiente | Estado |
|---|---|
| **Render App (`DATABASE_URL`)** | Actualizada para Neon Production (`ep-morning-wave-aciutlo4-pooler`) |
| **Neon Production** | Dados importados e validados. API pública a ler com sucesso. |
| **Neon Validation (`new-neon-validation`)** | Mantida (contém cópia de validação). Não apagada. |
| **Render DB antiga** | Mantida como backup temporário. Não apagada. |
| **Seed estrutural** | Não executado. |
| **Stash local (`main.ts`)** | Intacto, não aplicado. |

## 6. Próximos Passos Recomendados
1. Planear e executar o seed estrutural real em Neon Production para popular tabelas auxiliares (`hierarchy_levels`, `roles`, etc.).
2. Após período de observação, decidir se a base Render antiga pode ser descomissionada.
3. Após período de observação, decidir se a branch `new-neon-validation` pode ser apagada.
4. Considerar aplicação controlada do stash local pendente (`apps/api/src/main.ts`).
