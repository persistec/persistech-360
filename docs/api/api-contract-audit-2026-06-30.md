# API Contract Audit — 2026-06-30

## Objectivo

Auditar os endpoints existentes da API antes de novas funcionalidades de autenticação, autorização, soft delete e RLS.

## Observações Gerais e Segurança Legada

- **Mecanismo de Autenticação Temporária**: A autenticação atual baseia-se no header `x-user-id`. O guard `AuthGuard` interceta o header, verifica a existência do utilizador na base de dados e valida se o estado deste é `ACTIVE`.
- **Papéis e Autorização (RBAC)**: O `AppRoleGuard` em conjunto com `@RequireAppRole(AppRole.ADMIN)` valida se o utilizador associado a `x-user-id` possui a permissão de administrador real (`ADMIN`).
- **Natureza Legada do Header**: O header `x-user-id` é estritamente **temporário e legado**. A arquitetura futura de segurança irá substituí-lo por autenticação real baseada em sessões com conta Google e tokens no backend, deixando de confiar em qualquer identificador passado diretamente pelo cliente.
- **Operações Destrutivas**: Os endpoints de remoção (`DELETE`) atualmente apagam fisicamente os dados da base de dados (hard delete). Numa fase futura, todas as operações de remoção de entidades de negócio serão migradas para soft delete/archive (atualização do campo `status` ou similar).

---

## Endpoints Auditados

### 1. Health Módulo
Controla o estado de saúde do serviço e da base de dados.

- **`GET /api/v1/health`**
  - **Controller**: `HealthController`
  - **Auth**: Nenhuma.
  - **Payload Esperado**: Nenhum.
  - **Resposta de Sucesso (200)**:
    ```json
    {
      "status": "UP",
      "timestamp": "2026-06-30T14:15:00.000Z",
      "database": "UP"
    }
    ```
  - **Erros Conhecidos (500)**: Caso a ligação à base de dados falhe.
    ```json
    {
      "status": "DOWN",
      "timestamp": "2026-06-30T14:15:00.000Z",
      "database": "DOWN",
      "error": "Mensagem detalhada do erro"
    }
    ```

---

### 2. Departments Módulo
Gestão dos departamentos organizacionais.

- **`GET /api/v1/departments`**
  - **Controller**: `DepartmentsController`
  - **Auth**: Nenhuma.
  - **Resposta (200)**: Array de `DepartmentResponseDto`.
    ```json
    [
      {
        "id": "uuid",
        "name": "Engenharia",
        "parentId": null,
        "createdAt": "2026-06-30T...",
        "updatedAt": "2026-06-30T..."
      }
    ]
    ```

- **`GET /api/v1/departments/:id`**
  - **Controller**: `DepartmentsController`
  - **Auth**: Nenhuma.
  - **Erros (404)**: Departamento não encontrado.

- **`POST /api/v1/departments`**
  - **Controller**: `DepartmentsController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Payload**: `CreateDepartmentDto` (`{ name: string, parentId?: string }`).
  - **Erros**:
    - `400 Bad Request`: parentId inválido (não existe).
    - `409 Conflict`: Nome do departamento já existe.

- **`PATCH /api/v1/departments/:id`**
  - **Controller**: `DepartmentsController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Payload**: `UpdateDepartmentDto` (`{ name?: string, parentId?: string }`).
  - **Erros**: `400 Bad Request`, `404 Not Found`, `409 Conflict`.

- **`DELETE /api/v1/departments/:id`**
  - **Controller**: `DepartmentsController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Nota de Segurança**: Atualmente faz hard delete.
  - **Erros**:
    - `400 Bad Request`: Se o departamento tiver subdepartamentos ou cargos vinculados.
    - `404 Not Found`.

---

### 3. Hierarchy Levels Módulo
Gestão de níveis hierárquicos.

- **`GET /api/v1/hierarchy-levels`**
  - **Controller**: `HierarchyLevelsController`
  - **Auth**: Nenhuma.
  - **Resposta (200)**: Array de `HierarchyLevelResponseDto`.

- **`GET /api/v1/hierarchy-levels/:id`**
  - **Controller**: `HierarchyLevelsController`
  - **Auth**: Nenhuma.

- **`POST /api/v1/hierarchy-levels`**
  - **Controller**: `HierarchyLevelsController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Payload**: `CreateHierarchyLevelDto` (`{ name: string, rank: number }`).
  - **Erros**: `409 Conflict` se nome ou rank já existirem.

- **`PATCH /api/v1/hierarchy-levels/:id`**
  - **Controller**: `HierarchyLevelsController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.

- **`DELETE /api/v1/hierarchy-levels/:id`**
  - **Controller**: `HierarchyLevelsController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Erros**: `400 Bad Request` se possuir relações.

---

### 4. Roles Módulo
Gestão dos cargos organizacionais.

- **`GET /api/v1/roles`**
  - **Controller**: `RolesController`
  - **Auth**: Nenhuma.

- **`GET /api/v1/roles/:id`**
  - **Controller**: `RolesController`
  - **Auth**: Nenhuma.

- **`POST /api/v1/roles`**
  - **Controller**: `RolesController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Payload**: `CreateRoleDto` (`{ name: string, departmentId: string, hierarchyLevelId: string }`).
  - **Erros**: `400 Bad Request` se departamento ou nível hierárquico forem inválidos.

- **`PATCH /api/v1/roles/:id`**
  - **Controller**: `RolesController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.

- **`DELETE /api/v1/roles/:id`**
  - **Controller**: `RolesController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Erros**: `400 Bad Request` se existirem utilizadores associados a este cargo.

---

### 5. Users Módulo
Gestão de utilizadores (colaboradores).

- **`GET /api/v1/users`**
  - **Controller**: `UsersController`
  - **Auth**: Nenhuma.

- **`GET /api/v1/users/:id`**
  - **Controller**: `UsersController`
  - **Auth**: Nenhuma.

- **`POST /api/v1/users`**
  - **Controller**: `UsersController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Payload**: `CreateUserDto` (`{ name: string, email: string, roleId: string, managerId?: string, appRole?: AppRole }`).
  - **Erros**:
    - `400 Bad Request`: Cargo ou manager não encontrados.
    - `409 Conflict`: E-mail ou Google subject já cadastrados.

- **`PATCH /api/v1/users/:id`**
  - **Controller**: `UsersController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.

- **`DELETE /api/v1/users/:id`**
  - **Controller**: `UsersController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Erros**: `400 Bad Request` se possuir relações.

---

### 6. Cycles Módulo
Ciclos de avaliação periódica.

- **`GET /api/v1/cycles`**
  - **Controller**: `CyclesController`
  - **Auth**: Nenhuma.

- **`GET /api/v1/cycles/:id`**
  - **Controller**: `CyclesController`
  - **Auth**: Nenhuma.

- **`POST /api/v1/cycles`**
  - **Controller**: `CyclesController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Payload**: `CreateCycleDto`.

- **`PATCH /api/v1/cycles/:id`**
  - **Controller**: `CyclesController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.

- **`DELETE /api/v1/cycles/:id`**
  - **Controller**: `CyclesController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Erros**: `400 Bad Request` se ciclo não estiver em draft ou possuir atribuições.

- **`POST /api/v1/cycles/:id/open`**
  - **Controller**: `CyclesController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.

- **`POST /api/v1/cycles/:id/close`**
  - **Controller**: `CyclesController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.

- **`POST /api/v1/cycles/:id/generate-assignments`**
  - **Controller**: `CyclesController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Resposta (201)**: `{ generatedCount: number }`.

- **`GET /api/v1/cycles/:id/assignments`**
  - **Controller**: `CyclesController`
  - **Auth**: Nenhuma.

---

### 7. Evaluation Assignments Módulo
Relações de quem avalia quem num ciclo.

- **`GET /api/v1/evaluation-assignments`**
  - **Controller**: `EvaluationAssignmentsController`
  - **Auth**: Nenhuma.

- **`GET /api/v1/evaluation-assignments/:id`**
  - **Controller**: `EvaluationAssignmentsController`
  - **Auth**: Nenhuma.

- **`GET /api/v1/evaluation-assignments/:id/applicable-criteria`**
  - **Controller**: `EvaluationAssignmentsController`
  - **Auth**: Nenhuma. Utiliza o `ApplicabilityEngineService` para deduzir critérios aplicáveis de acordo com o domínio.

- **`POST /api/v1/evaluation-assignments`**
  - **Controller**: `EvaluationAssignmentsController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Payload**: `CreateAssignmentDto`.
  - **Erros**:
    - `400 Bad Request`: Autoavaliação ou tentativa de avaliar um superior.

- **`PATCH /api/v1/evaluation-assignments/:id`**
  - **Controller**: `EvaluationAssignmentsController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.

- **`DELETE /api/v1/evaluation-assignments/:id`**
  - **Controller**: `EvaluationAssignmentsController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.

---

### 8. Evaluation Submissions Módulo
Formulários e submissões das respostas de avaliações.

- **`GET /api/v1/evaluation-submissions`**
  - **Controller**: `EvaluationSubmissionsController`
  - **Auth**: Nenhuma (Rota livre provisória).

- **`GET /api/v1/evaluation-submissions/:id`**
  - **Controller**: `EvaluationSubmissionsController`
  - **Auth**: Nenhuma.

- **`GET /api/v1/evaluation-assignments/:id/submission`**
  - **Controller**: `EvaluationSubmissionsController`
  - **Auth**: Nenhuma.

- **`POST /api/v1/evaluation-assignments/:id/submission`**
  - **Controller**: `EvaluationSubmissionsController`
  - **Auth**: Nenhuma.

- **`PATCH /api/v1/evaluation-submissions/:id`**
  - **Controller**: `EvaluationSubmissionsController`
  - **Payload**: `UpdateSubmissionDto`.
  - **Auth**: Nenhuma.

- **`POST /api/v1/evaluation-submissions/:id/submit`**
  - **Controller**: `EvaluationSubmissionsController`
  - **Auth**: Nenhuma.

- **`GET /api/v1/evaluation-submissions/:id/answers`**
  - **Controller**: `EvaluationSubmissionsController`
  - **Auth**: Nenhuma.

- **`PUT /api/v1/evaluation-submissions/:id/answers`**
  - **Controller**: `EvaluationSubmissionsController`
  - **Payload**: `UpsertAnswersDto`.
  - **Auth**: Nenhuma.

---

### 9. Results Visibility Módulo
Cálculo e filtragem de visualização de resultados de acordo com o papel.

- **`GET /api/v1/cycles/:cycleId/evaluatees/:evaluateeId/results/admin`**
  - **Controller**: `ResultsVisibilityController`
  - **Auth**: `AuthGuard`, `AppRoleGuard` (`ADMIN`). Exige `x-user-id`.
  - **Resposta (200)**: `AdminResultViewDto` (contém pontuações detalhadas de dimensões e critérios).

- **`GET /api/v1/cycles/:cycleId/evaluatees/:evaluateeId/results/employee`**
  - **Controller**: `ResultsVisibilityController`
  - **Auth**: `AuthGuard`, `EvaluateeAccessGuard` (permite apenas o próprio colaborador avaliado ou admins). Exige `x-user-id`.
  - **Resposta (200)**: `EmployeeResultViewDto` (contém dados anonimizados agregados).

---

### 10. Scoring Módulo
Motor de cálculo de pontuações de ciclo.

- **`GET /api/v1/cycles/:id/results`**
  - **Controller**: `ScoringController`
  - **Auth**: Nenhuma.
  - **Resposta (200)**: `CycleResultsSummaryDto`.

- **`GET /api/v1/cycles/:cycleId/evaluatees/:evaluateeId/results`**
  - **Controller**: `ScoringController`
  - **Auth**: Nenhuma.
  - **Resposta (200)**: `EvaluateeResultsDto`.

---

## Divergências e Próximas Issues

1. **Lacuna Crítica de Autenticação**:
   - Vários endpoints sensíveis, em particular todo o módulo de `EvaluationSubmissionsController` (leitura, escrita e submissão de respostas) e `ScoringController` (leitura de resultados agregados por ciclo), não possuem qualquer guard de autenticação (`AuthGuard`) associado. Qualquer utilizador ou cliente externo consegue aceder e modificar submissões de terceiros.
   - **Recomendação**: Criar issue futura para fechar o acesso ao módulo de submissões e scoring, exigindo que o utilizador autenticado corresponda ao avaliador da atribuição associada.
2. **Uso Indevido de ID no URL**:
   - Em caminhos de rotas do colaborador (ex. `/cycles/:cycleId/evaluatees/:evaluateeId/results/employee`), o ID do colaborador é passado diretamente no URL. Com autenticação real por sessão, a identidade deve ser inferida a partir do contexto da sessão do backend.
   - **Recomendação**: Futura issue para introduzir rotas orientadas ao utilizador corrente, como `/api/v1/my-results` ou `/api/v1/cycles/:cycleId/my-results`.
3. **Persistência de Dados e Relações Ativas**:
   - Operações `DELETE` limpam fisicamente os departamentos e utilizadores, quebrando a integridade de ciclos de avaliação passados.
   - **Recomendação**: Refatorizar a eliminação para Soft Delete/Archive (Issue #68).
