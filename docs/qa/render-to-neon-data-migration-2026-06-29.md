# Relatório de Migração: Render -> Neon (Data-Only)

**Data:** 2026-06-29
**Estado:** Validação de restore bem-sucedida em ambiente descartável. Pronto para a migração final de produção.

## 1. Informações de Execução (Fases 1 a 3)
- **Data/Hora do Dump Final:** 2026-06-29 12:38 (UTC+1)
- **Ficheiro de Dump:** `render-data.dump` (5719 bytes, em formato personalizado data-only, sem `_prisma_migrations`).
- **Ambiente Git:** Seguro e limpo. Todas as credenciais de `.env.*` mantêm-se protegidas e ignoradas.

## 2. Contagens Finais e Reconciliação (Fase 5)
O restore foi efetuado com êxito na branch descartável `new-neon-validation` (base de dados `persistech-360`).
A tabela abaixo demonstra a perfeita correspondência dos dados pós-restore:

| Tabela | Render Source (Final) | Neon Validation (`new-neon-validation`) | Estado |
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

## 3. Resultado do Smoke Test Local (Fase 6)
Com a API NestJS local temporariamente apontada para a sandbox `new-neon-validation`:
- **GET /api/v1/health:** `{"status":"UP","timestamp":"...","database":"UP"}` (Base Neon respondendo com sucesso).
- **GET /api/v1/departments:** Retornou a lista contendo o departamento `"Comercial"` restaurado (ID: `f08b4516-bd1c-470c-a756-dccf1d09b937`).

## 4. Segurança do Ambiente de Produção
- > [!IMPORTANT]
  > A base de dados **Neon Production** (`ep-morning-wave-aciutlo4-pooler`) **NÃO foi alterada nem acedida para escritas** nesta fase, mantendo-se em estado vazio intacto.
  - A `DATABASE_URL` no serviço de alojamento da Render não foi alterada.

## 5. Riscos e Notas Técnicas
- **search_path do Neon:** A branch clonada sob a opção **Schema only** veio com a variável `search_path` vazia por padrão, o que impossibilita a resolução direta de tabelas globais pelo `psql` na linha de comandos sem a devida qualificação do schema (ex. `public.users` ou executando `SET search_path TO public`). A aplicação (Prisma / NestJS) comportou-se com sucesso no mapeamento sem necessitar de ajustes manuais adicionais.

## 6. Recomendação Objectiva
Recomenda-se avançar com a importação final para a **Neon Production**, uma vez que a estrutura do dump, compatibilidade Postgres 18.4, integridade referencial dos dados (inclusive constraints circulares de user/department) e funcionamento da API foram devidamente assegurados em sandbox.
