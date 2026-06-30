# Security, Access and Data Policy Architecture

## Estado

Proposta técnica versionada para a próxima fase do Persistech-360.

## Contexto

A aplicação precisa evoluir de uma ferramenta administrativa inicial para uma plataforma multiutilizador com autenticação, autorização, áreas separadas e segurança em profundidade.

A API actualmente ainda possui mecanismos temporários, como `x-user-id`, e endpoints com semântica de `DELETE` físico. Estes mecanismos devem ser substituídos por autenticação real, autorização por sessão e soft delete/archive.

## Princípios

- Não haverá registo aberto.
- Login será feito apenas com Google.
- Apenas utilizadores previamente autorizados internamente podem aceder.
- A UI não é fronteira de segurança suficiente.
- A API deve aplicar autenticação e autorização reais.
- A base de dados deve futuramente reforçar segurança com RLS.
- Entidades de negócio não devem ser removidas fisicamente da base.
- Operações visíveis como “Eliminar” devem arquivar/desactivar registos.
- Rotas devem ser orientadas à URL.
- A navegação deve reflectir permissões reais do utilizador autenticado.

## Áreas da aplicação

### `/auth`

Área pública de autenticação.

Rotas previstas:

- `/auth/login`
- `/auth/google`
- `/auth/google/callback`

Não haverá `/auth/register`.

### `/app`

Área principal para utilizadores não-admin.

Objectivo:

- avaliações pendentes;
- avaliações a realizar;
- histórico pessoal;
- resultados permitidos;
- perfil;
- definições pessoais.

Exemplos:

- `/app`
- `/app/avaliacoes`
- `/app/avaliacoes/[id]`
- `/app/resultados`
- `/app/perfil`
- `/app/definicoes`

### `/admin`

Área administrativa.

Exemplos:

- `/admin`
- `/admin/departamentos`
- `/admin/departamentos/novo`
- `/admin/contas`
- `/admin/contas/novo`
- `/admin/cargos`
- `/admin/niveis-hierarquicos`
- `/admin/ciclos`
- `/admin/criterios`
- `/admin/relatorios`
- `/admin/definicoes`

## Regras de roteamento

- Usar URL real para cada recurso.
- Não concentrar todas as páginas numa única rota.
- `/**/[recurso]/novo` deve representar criação.
- Tabs, filtros e diálogos podem usar query params ou hash.
- O path representa o recurso principal.
- Query params representam estado navegável como filtros, tabs, paginação ou modais.
- Hash representa âncoras ou secções visuais locais.

## Modelo de autenticação

### Google OAuth

Fluxo previsto:

1. Utilizador abre `/auth/login`.
2. Utilizador escolhe login com Google.
3. Google autentica identidade.
4. Backend valida callback.
5. Backend verifica se o email/sub Google existe numa conta interna autorizada.
6. Se autorizado, cria sessão/token.
7. Se não autorizado, nega acesso com mensagem controlada.

### Sem registo aberto

A aplicação não deve criar automaticamente contas activas para qualquer conta Google válida.

Estados possíveis de conta:

- `INVITED`
- `ACTIVE`
- `SUSPENDED`
- `ARCHIVED`

## Modelo de autorização

A autorização deve considerar:

- papel global;
- permissões por domínio;
- estado da conta;
- relação com o recurso;
- contexto do ciclo de avaliação;
- departamento;
- hierarquia.

Papéis iniciais sugeridos:

- `SYSTEM_ADMIN`
- `HR_ADMIN`
- `MANAGER`
- `EMPLOYEE`
- `AUDITOR`

Estes papéis são ponto de partida, não implementação final.

## Matriz inicial de permissões

| Área/Recurso | SYSTEM_ADMIN | HR_ADMIN | MANAGER | EMPLOYEE | AUDITOR |
|---|---:|---:|---:|---:|---:|
| Aceder `/admin` | Sim | Sim | Parcial | Não | Leitura |
| Gerir departamentos | Sim | Sim | Não | Não | Leitura |
| Gerir contas | Sim | Sim | Não | Não | Leitura |
| Gerir cargos/níveis | Sim | Sim | Não | Não | Leitura |
| Gerir ciclos | Sim | Sim | Parcial | Não | Leitura |
| Ver avaliações pendentes próprias | Sim | Sim | Sim | Sim | Não |
| Submeter avaliações próprias | Sim | Sim | Sim | Sim | Não |
| Ver resultados agregados | Sim | Sim | Parcial | Restrito | Leitura |
| Arquivar entidades | Sim | Sim | Não | Não | Não |
| Restaurar entidades | Sim | Sim | Não | Não | Não |

A matriz deve ser refinada antes da implementação.

## Protecção no frontend

A camada web deve:

- bloquear páginas sem sessão;
- redireccionar anónimos para `/auth/login`;
- bloquear `/admin` para utilizadores sem permissão;
- redireccionar utilizadores autenticados comuns para `/app`;
- ocultar navegação não permitida;
- nunca depender apenas da UI para segurança real.

Implementação futura prevista:

- middleware/proxy no Next.js;
- layouts separados para `/app`, `/admin` e `/auth`;
- carregamento de permissões da sessão;
- fallback de acesso negado.

## Protecção na API

A API deve:

- substituir `x-user-id` por sessão/token validado;
- extrair `userId` real do contexto autenticado;
- aplicar guards por endpoint;
- aplicar políticas por recurso/acção;
- evitar IDs de utilizador sensíveis em URLs quando a identidade deve vir da sessão;
- retornar erros consistentes.

Exemplo futuro:

- `AuthGuard`
- `PermissionGuard`
- decorator `@RequirePermission(...)`
- contexto `CurrentUser`

## Política de dados

### Proibição de hard delete

A API não deve executar hard delete em entidades de negócio.

Entidades abrangidas:

- departamentos;
- utilizadores;
- cargos;
- níveis hierárquicos;
- ciclos;
- dimensões;
- critérios;
- opções de critérios;
- regras de aplicabilidade;
- regras de peso;
- políticas de retenção;
- atribuições;
- submissões;
- respostas;
- resultados calculados, quando persistidos.

### Soft delete / archive

Operações visíveis como “Eliminar” devem tornar o registo inacessível por padrão, sem removê-lo fisicamente.

Campos recomendados:

- `status`
- `archivedAt`
- `archivedBy`
- `archiveReason`

Estados possíveis:

- `ACTIVE`
- `INACTIVE`
- `ARCHIVED`
- `SUSPENDED`

Listagens padrão devem excluir `ARCHIVED`.

Operações de restauração devem existir apenas quando fizer sentido e exigir permissão elevada.

## RLS futura

RLS deve ser considerada após autenticação e autorização estarem consolidadas.

A API deverá propagar contexto seguro para o PostgreSQL, possivelmente com:

```sql
SET LOCAL app.user_id = '...';
SET LOCAL app.role = '...';
```

As políticas RLS devem reforçar:

* isolamento por utilizador;
* permissões por papel;
* visibilidade por ciclo;
* visibilidade por departamento;
* anonimato em resultados;
* restrições de submissão.

RLS não substitui guards na API.

## Impacto nas issues existentes

### #62

Deve tratar a navegação como estrutura URL-oriented com `/app`, `/admin` e `/auth`, não apenas como shell responsivo.

### #68

Deve substituir hard delete por soft delete/archive.

### #88

Fica bloqueada até existir soft delete/archive. A limpeza deve arquivar/desactivar os resíduos, não apagá-los fisicamente.

### #67 e #69

A auditoria de contratos e OpenAPI servem como base para a fase de segurança.

## Ordem recomendada de implementação

1. Auditar contratos API e Swagger/OpenAPI.
2. Definir arquitectura de autenticação/autorização.
3. Implementar Google login sem registo aberto.
4. Substituir `x-user-id` por sessão/token e guards.
5. Reestruturar rotas `/auth`, `/app` e `/admin`.
6. Implementar soft delete/archive.
7. Arquivar resíduos de teste em produção.
8. Preparar RLS.
9. Implementar E2E e checklist final de QA.

## Fora do escopo deste documento

* Implementação de login.
* Implementação de guards.
* Migrações Prisma.
* RLS.
* Alterações de UI.
* Limpeza de dados em produção.

## Variáveis de Ambiente de Segurança

As seguintes variáveis de ambiente devem ser configuradas para suportar a autenticação Google e as sessões JWT:

### Backend (`apps/api/.env`)
* `GOOGLE_CLIENT_ID`: ID do cliente OAuth2 fornecido pela Google Cloud Console.
* `GOOGLE_CLIENT_SECRET`: Segredo do cliente OAuth2 fornecido pela Google Cloud Console.
* `GOOGLE_CALLBACK_URL`: URL completo de retorno (ex: `http://localhost:4000/api/v1/auth/google/callback`).
* `JWT_SECRET`: Chave simétrica longa e segura para assinar o JWT.
* `AUTH_COOKIE_NAME`: (Opcional) Nome do cookie da sessão (padrão: `PERSISTECH360_SESSION`).
* `AUTH_COOKIE_SECURE`: `true` em produção (requer HTTPS), `false` em desenvolvimento local.
* `WEB_APP_URL`: URL base do frontend para redirecionamento após o login.

### Frontend (`apps/web/.env`)
* `NEXT_PUBLIC_API_BASE_URL`: URL base da API para redirecionar o botão de login (ex: `http://localhost:4000/api/v1`).
* (A injeção de `NEXT_PUBLIC_ADMIN_USER_ID` é removida).
