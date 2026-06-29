# Preparação para Migração: Render -> Neon (Data-Only)

**Data:** 2026-06-29
**Estado:** Pré-checks de origem e destino validados, a aguardar bloqueios finais.

## Ferramentas Validadas
- **pg_dump:** PostgreSQL 18.3 (Encontrado via `%ProgramFiles%\PostgreSQL\18\bin`)
- **pg_restore:** PostgreSQL 18.3
- **Ambiente Git:** Limpo (`.env.*`, `tmp/`, `*.dump` estão devidamente ignorados no `.gitignore`).

## Validação de Servidores e Contagens (Pré-Check)
*(Aviso: O snapshot da origem não é final. A janela sem escritas não foi ainda assegurada.)*

| Origem Lógica | Host (Sanitizado) | Database | Versão PostgreSQL | Estado Conectividade |
|---|---|---|---|---|
| **Render Source** | `dpg-d8knoo0jo6nc73fp7dpg-a.virginia-postgres.render.com` | `persistech_360_db` | `PostgreSQL 18.4` | Acessível |
| **Neon Validation** | `ep-snowy-dew-acq45dn2-pooler.sa-east-1.aws.neon.tech` | `persistech-360` | `PostgreSQL 18.4` | Acessível |
| **Neon Production**| `ep-morning-wave-aciutlo4-pooler.sa-east-1.aws.neon.tech` | `persistech-360` | `PostgreSQL 18.4` | Acessível |

### Contagens Globais Iniciais
**Render Source (Origem real):**
- *Pendente (A primeira tentativa falhou em DNS, confirmou-se que está acessível, no entanto não extraímos os counts puros desta vez, mas sabemos que users e departments têm >= 1).*

**Neon Validation (Sandbox Descartes):**
- Users: 1
- Departments: 4
- Hierarchy Levels: 6
- Roles: 5
- Demais tabelas: 0.
*(Estes dados correspondem ao ensaio de bootstrap inicial).*

**Neon Production (Destino Real):**
- Users: 0
- Departments: 0
- Todas as tabelas operacionais: 0.
*(A produção encontra-se factualmente vazia, validada através de contagem real `COUNT(*)`, estando livre para importação).*

### Notas de Diagnóstico (DNS vs Credenciais):
As tentativas iniciais de ligação ao Neon (Fase 5 anterior) falharam com erro de DNS (`Name or service not known`). Foi realizado um diagnóstico exaustivo de rede (`Resolve-DnsName`, `nslookup`, `Test-NetConnection`) e concluímos que o problema se deveu a caracteres indesejados (*quotes* ou quebras de linha introduzidas na URL). Após sanitização estrita, **o DNS e a ligação funcionaram perfeitamente para todos os ambientes**.

## Bloqueios Restantes antes do Dump Final
1. Contagens read-only precisas da **Render source** (necessário para reconciliação pós-migração).
2. Confirmação inequívoca de **Janela Sem Escritas** na API antiga.
3. **Autorização explícita** para correr o Dump final.
