# Preparação para Migração: Render -> Neon (Data-Only)

**Data:** 2026-06-29
**Estado:** Bloqueado na Fase 5 (Falta de confirmação de janela sem escritas e falha de conectividade).

## Ferramentas Validadas
- **pg_dump:** PostgreSQL 18.3 (Encontrado via `%ProgramFiles%\PostgreSQL\18\bin`)
- **pg_restore:** PostgreSQL 18.3
- **Ambiente Git:** Limpo (`.env.*`, `tmp/`, `*.dump` estão devidamente ignorados no `.gitignore`).

## Validação de Servidores e Contagens (Pré-Check)
*(Aviso: não é um snapshot final. A janela sem escritas não foi ainda assegurada.)*

| Origem Lógica | Host (Sanitizado) | Database | Versão PostgreSQL | Estado Conectividade | Contagens Globais (Parciais) |
|---|---|---|---|---|---|
| **Render Source** | `dpg-d8knoo0jo6nc73fp7dpg-a.virginia-postgres.render.com` | `persistech_360_db` | `PostgreSQL 18.4` (Via Node) | Falha no `psql` (DNS/Hostname) | Não foi possível obter na íntegra. |
| **Neon Validation** | `ep-snowy-dew-acq45dn2-pooler.sa-east-1.aws.neon.tech` | `persistech-360` | Desconhecida | Falha de resolução / DNS | N/A |
| **Neon Production**| `ep-morning-wave-aciutlo4-pooler.sa-east-1.aws.neon.tech` | `persistech-360` | Desconhecida | Falha de resolução / DNS | N/A |

### Notas do Pré-Check:
A execução da conectividade local encontrou dificuldades em resolver o DNS dos *hosts* fornecidos nos ficheiros `.env.*` (tanto o Render externo como os *poolers* do Neon). É provável que os *endpoints* facultados possuam bloqueios de Firewall a conexões externas ou que requeiram *connection strings* mais específicas (ex: SNI param ou `directUrl` bypass). No entanto, não ocorreu vazamento de *secrets* em logs ou repositórios, garantindo a integridade dos ficheiros originais.

## Bloqueios Restantes (Próximos Passos)
1. **Janela Sem Escritas:** Confirmar que a aplicação original está parada antes de proceder à exportação oficial (Fase 4).
2. **Resolução de Conectividade:** Garantir que o IP da nossa máquina/ambiente de execução se encontra na `allowlist` (Whitelist IP) das firewalls da Render e da Neon, de forma a podermos executar o `pg_dump` e o `pg_restore` com êxito sobre os hosts.
