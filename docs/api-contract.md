# Contrato da API

## Princípio

Frontend e backend comunicam por API HTTP versionada.

O frontend não deve importar ficheiros fonte, DTOs ou tipos diretamente do backend.

Não há pacote runtime partilhado durante o MVP.

## Versionamento

As rotas devem usar versionamento:

```text
/api/v1/...
````

Mudanças incompatíveis devem ser documentadas e coordenadas.

## OpenAPI

O backend NestJS deve expor documentação OpenAPI/Swagger.

O frontend pode:

* declarar tipos locais manualmente;
* ou gerar um cliente local dentro de `apps/web`.

Clientes gerados devem ficar dentro de `apps/web`.

## Política de mudança de contrato

Se uma alteração no backend não mudar a forma pública da API, apenas o backend precisa de deploy.

Se uma alteração no frontend consumir a API existente, apenas o frontend precisa de deploy.

Se a forma da API mudar de maneira incompatível:

* atualizar backend;
* atualizar frontend;
* atualizar documentação;
* coordenar deploy.

## Formato recomendado de erro

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

## Autenticação

Endpoints protegidos devem validar o utilizador no backend.

O backend não deve confiar em identidade enviada diretamente pelo frontend.

## Convenções HTTP

Recomendação geral:

```text
GET    /api/v1/resources
GET    /api/v1/resources/:id
POST   /api/v1/resources
PATCH  /api/v1/resources/:id
DELETE /api/v1/resources/:id
```

Operações de domínio que não são CRUD simples podem usar ações explícitas:

```text
POST /api/v1/cycles/:id/open
POST /api/v1/cycles/:id/close
POST /api/v1/cycles/:id/publish-results
POST /api/v1/cycles/:id/generate-assignments
```

## Endpoints administrativos base

Durante a fundação do MVP, o backend expõe CRUD administrativo para dados
estruturais do domínio. Estes endpoints não implementam autenticação nem
autorização ainda; antes de produção devem ser protegidos no backend.

```text
GET    /api/v1/departments
GET    /api/v1/departments/:id
POST   /api/v1/departments
PATCH  /api/v1/departments/:id
DELETE /api/v1/departments/:id

GET    /api/v1/hierarchy-levels
GET    /api/v1/hierarchy-levels/:id
POST   /api/v1/hierarchy-levels
PATCH  /api/v1/hierarchy-levels/:id
DELETE /api/v1/hierarchy-levels/:id

GET    /api/v1/roles
GET    /api/v1/roles/:id
POST   /api/v1/roles
PATCH  /api/v1/roles/:id
DELETE /api/v1/roles/:id

GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

Regras de contrato destes endpoints:

- registos inexistentes devolvem `404`;
- conflitos de unicidade devolvem `409`;
- relações inválidas devolvem `400`;
- deletes bloqueados por relações dependentes devolvem `400`;
- respostas de `User` não expõem `googleSub`.

## Compatibilidade

Evitar quebrar contrato da API sem necessidade.

Quando uma mudança incompatível for inevitável, registrar em `docs/open-decisions.md` ou documentação de release.

## Responsabilidade do backend

O backend decide:

* quem é o utilizador autenticado;
* quais permissões ele possui;
* quais ciclos pode ver;
* quem pode avaliar;
* quais perguntas aparecem;
* quando pode editar;
* quais resultados pode consultar;
* se pode exportar dados.

## Responsabilidade do frontend

O frontend apenas consome respostas da API e apresenta a interface adequada.

Validações no frontend são permitidas para melhorar experiência, mas nunca substituem validação do backend.

## Paginação

Listagens devem usar paginação.

Formato sugerido:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

## Datas

Datas devem ser transmitidas em formato ISO 8601.

Exemplo:

```text
2026-05-26T15:30:00.000Z
```

## Nomes de campos

Usar `camelCase` nas respostas JSON.

Exemplo:

```json
{
  "cycleId": "uuid",
  "createdAt": "2026-05-26T15:30:00.000Z"
}
```

## Endpoints de Ciclos e Atribuições

### Cycles (/api/v1/cycles)
- `GET /api/v1/cycles`: Lista todos os ciclos criados.
- `GET /api/v1/cycles/:id`: Devolve os detalhes de um ciclo específico.
- `POST /api/v1/cycles`: Cria um novo ciclo de avaliação.
  * Validações: `startAt` e `endAt` obrigatórios; `endAt > startAt`; `retentionPolicyId` e `createdById` devem existir se informados.
- `PATCH /api/v1/cycles/:id`: Atualiza um ciclo existente.
- `DELETE /api/v1/cycles/:id`: Remove um ciclo.
  * Validações: Bloqueado se possuir atribuições, a menos que o estado seja `draft`.
- `POST /api/v1/cycles/:id/open`: Abre o ciclo.
  * Validações: Apenas a partir de `draft` ou `scheduled`. Exige pelo menos uma atribuição gerada.
- `POST /api/v1/cycles/:id/close`: Fecha o ciclo.
  * Validações: Apenas a partir de `open` ou `closing_soon`.
- `POST /api/v1/cycles/:id/generate-assignments`: Despoleta a geração automática de atribuições.
  * Validações: Bloqueado se o ciclo estiver fechado, publicado ou arquivado.
- `GET /api/v1/cycles/:id/assignments`: Lista todas as atribuições associadas ao ciclo.

### Evaluation Assignments (/api/v1/evaluation-assignments)
- `GET /api/v1/evaluation-assignments`: Lista todas as atribuições no sistema.
- `GET /api/v1/evaluation-assignments/:id`: Devolve uma atribuição pelo seu ID.
- `POST /api/v1/evaluation-assignments`: Cria manualmente uma atribuição.
  * Validações: `evaluatorId` diferente de `evaluateeId`; ambos devem existir e estar ativos; o avaliador não pode avaliar um superior na hierarquia (por manager ou rank); unicidade no ciclo.
- `PATCH /api/v1/evaluation-assignments/:id`: Atualiza uma atribuição.
- `DELETE /api/v1/evaluation-assignments/:id`: Remove uma atribuição.
