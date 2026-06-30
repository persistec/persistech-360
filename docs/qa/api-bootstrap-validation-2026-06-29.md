# Validação Operacional do Bootstrap (Neon Descartável)

**Data:** 2026-06-29
**Ambiente:** Branch temporária no Neon (Isolada de `production`)

## 1. Contexto e Segurança
O presente documento atesta os ensaios de validação de *bootstrap* (*seed* estrutural, criação do admin inicial e CRUD real) realizados estritamente contra uma branch temporária provisionada no Neon.
- **Database:** `persistech-360`
- **Host Utilizado:** `ep-snowy-dew-acq45dn2-pooler.sa-east-1.aws.neon.tech` (Confirmado sanitizadamente não ser o default `production`).
- **Segurança:** Nenhum secret, password ou token foi exposto. A connection string completa nunca foi iterada.

## 2. Testes de Seed Estrutural
- Verificação do estado das migrações retornou `Database schema is up to date!`.
- Comando executado: `npx prisma db seed` na branch temporária.
- **Contagens Finais Resultantes:**
  - `hierarchy_levels`: 6
  - `departments`: 4
  - `roles`: 5
  - `users`: 0

## 3. Bootstrap do Administrador
- Através da injeção isolada em terminal das variáveis de ambiente `INITIAL_ADMIN_EMAIL` (fictício) e `INITIAL_ADMIN_NAME`, o seed foi invocado novamente.
- **Resultado:**
  - `users` contagem total: 1
  - `appRole`: ADMIN
  - A idempotência funcionou na íntegra (execuções repetidas não duplicaram o administrador).
  - O e-mail real não foi registado nos logs.

## 4. HTTP Smoke Testing Mutável
A API local foi ativada apontando em exclusivo para o host temporário. Via `curl.exe`, os seguintes cenários CRUD reais foram bem-sucedidos:
- `GET /api/v1/health`: Sucesso (`{"status":"UP","database":"UP"}`).
- `GET /api/v1/departments`: Retornou a lista base.
- `POST /api/v1/departments` (Válido): Criou a entidade `Test Dept Valid`.
- `POST /api/v1/departments` (Inválido): Retornou exceção controlada `400 Bad Request` na ausência de payload obrigatório.
- `PATCH /api/v1/departments/:id`: Retornou a entidade alterada para `Test Dept Patched`.
- `DELETE /api/v1/departments/:id`: Removeu a entidade com sucesso, mantendo a integridade.

## 5. Próximos Passos (Ações Requeridas)
- **Eliminação no Neon:** A branch temporária (host `ep-snowy-dew-acq45dn2-pooler.sa-east-1.aws.neon.tech`) pode e deve ser apagada no painel de controlo do Neon.
- **Produção Intacta:** A instância default/production de `persistech-360` manteve-se intocável, limpa de seeds de teste e de inserções CRUD espúrias.
