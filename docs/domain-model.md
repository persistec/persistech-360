# Modelo de domínio

## Visão geral

Este documento descreve o modelo conceitual de dados do sistema Persistech 360.

O sistema deve usar uma base de dados relacional, preferencialmente PostgreSQL, porque o domínio exige integridade, unicidade, relações claras, auditoria e consistência transacional. Tentar fazer isto como se fosse uma coleção de objetos soltos seria uma excelente forma de criar sofrimento com interface moderna.

O backend é o único dono da persistência. O frontend nunca deve aceder diretamente à base de dados.

## Entidades principais

### User

Representa um colaborador da empresa.

Campos sugeridos:

```text
id
google_sub
workspace_email
name
department_id
role_id
hierarchy_level_id
manager_id
status
created_at
updated_at
```

Notas:

- `google_sub` identifica de forma estável o utilizador autenticado pelo Google.
- `workspace_email` deve corresponder ao email corporativo.
- `manager_id` aponta para outro `User`.
- `status` pode indicar se o colaborador está ativo, inativo, suspenso ou removido.
- A API administrativa aceita `google_sub` para preparação de integração, mas não deve expor este campo nas respostas públicas.

### Department

Representa um departamento, área ou unidade interna.

Campos sugeridos:

```text
id
name
parent_department_id
created_at
updated_at
```

Notas:

- `parent_department_id` permite hierarquia entre departamentos.
- Nem toda estrutura do Google Workspace será suficiente para avaliação, por isso a aplicação pode manter esta estrutura internamente.

### Role

Representa o cargo ou função do colaborador.

Campos sugeridos:

```text
id
name
department_id
hierarchy_level_id
created_at
updated_at
```

Notas:

- Um cargo pode pertencer a um departamento.
- Um cargo deve estar associado a um nível hierárquico.

### HierarchyLevel

Representa o nível hierárquico.

Campos sugeridos:

```text
id
name
rank
created_at
updated_at
```

Notas:

- Quanto maior o `rank`, maior o nível hierárquico.
- Esta entidade é essencial para impedir avaliação de superiores.

Exemplo:

```text
1 - Estagiário
2 - Técnico / Operacional
3 - Sénior / Especialista
4 - Coordenador
5 - Gestor
6 - Direção
```

### Cycle

Representa um ciclo de avaliação.

Campos sugeridos:

```text
id
name
description
start_at
end_at
status
retention_policy_id
created_by_id
created_at
updated_at
```

Estados possíveis:

```text
draft
scheduled
open
closing_soon
closed
results_published
archived
```

Notas:

- Um ciclo define período, regras, participantes, política de retenção e estado.
- Critérios e pesos usados num ciclo devem ser versionados ou preservados para evitar alteração histórica indevida.

### EvaluationAssignment

Define que um utilizador deve ou pode avaliar outro utilizador num ciclo.

Campos sugeridos:

```text
id
cycle_id
evaluator_id
evaluatee_id
relationship_type
status
required
created_at
updated_at
```

Restrição obrigatória:

```text
UNIQUE(cycle_id, evaluator_id, evaluatee_id)
```

Notas:

- Esta entidade é a matriz de elegibilidade materializada.
- O sistema deve impedir `evaluator_id = evaluatee_id`.
- O sistema deve impedir que o avaliador avalie alguém acima dele na hierarquia.

Tipos possíveis de `relationship_type`:

```text
same_department_peer
cross_department_peer
manager_to_subordinate
manual_assignment
```

### EvaluationSubmission

Representa uma avaliação submetida ou em rascunho, vinculada a uma assignment.

Campos sugeridos:

```text
id
assignment_id
final_comment
submitted_at
created_at
updated_at
```

Restrições obrigatórias:

```text
UNIQUE(assignment_id)
```

Notas:

- Enquanto a data `submitted_at` não estiver preenchida, é considerada um rascunho.
- Enquanto o rascunho existir e o ciclo estiver aberto, a avaliação pode ser editada (respostas).
- Após a submissão, a avaliação é fechada e as edições normais são bloqueadas.

### EvaluationAnswer

Representa uma resposta fechada dada a um critério.

Campos sugeridos:

```text
id
submission_id
criterion_id
criterion_option_id
score_value_snapshot
created_at
updated_at
```

Restrições obrigatórias:

```text
UNIQUE(submission_id, criterion_id)
```

Notas:

- `score_value_snapshot` deve ser copiado de `CriterionOption.scoreValue` no momento da submissão para preservar histórico.
- Respostas explícitas de `N/A` devem ser passadas com `criterion_option_id = null`.
- Critérios inativos não podem ser respondidos.

### EvaluationRevision

Guarda histórico de alterações de uma avaliação.

Campos sugeridos:

```text
id
evaluation_id
version_number
changed_by
changed_at
snapshot_json
change_reason
```

Notas:

- Cada edição relevante deve gerar uma revisão.
- `snapshot_json` deve conter o estado da avaliação naquele momento.
- Isto é obrigatório para auditoria.

### Dimension

Representa uma dimensão de avaliação.

Campos sugeridos:

```text
id
name
type
description
weight
active
created_at
updated_at
```

Tipos possíveis:

```text
corporate
departmental
leadership
```

Exemplos:

```text
Colaboração
Comunicação
Responsabilidade
Competência Técnica
Liderança
```

### Criterion

Representa uma pergunta ou critério específico dentro de uma dimensão.

Campos sugeridos:

```text
id
dimension_id
text
description
weight
active
created_at
updated_at
```

Notas:

- Critérios podem ser corporativos, departamentais ou de liderança por associação à dimensão.
- Critérios inativos não devem aparecer em ciclos novos.
- Critérios usados em ciclos anteriores devem continuar preservados para histórico.

### CriterionOption

Representa uma resposta pré-definida para um critério.

Campos sugeridos:

```text
id
criterion_id
label
score_value
sort_order
created_at
updated_at
```

Exemplo:

```text
Muito abaixo do esperado -> 1
Abaixo do esperado -> 2
Dentro do esperado -> 3
Acima do esperado -> 4
Muito acima do esperado -> 5
Não tenho informação suficiente -> null
```

### ApplicabilityRule

Define quando uma dimensão ou critério se aplica.

Campos sugeridos:

```text
id
dimension_id
criterion_id
relationship_type
same_department_required
cross_department_allowed
min_hierarchy_rank
max_hierarchy_rank
required_role_family
blocked_if_evaluatee_above_evaluator
created_at
updated_at
```

Notas:

- Pode aplicar-se a uma dimensão inteira ou a um critério específico.
- O motor de aplicabilidade usa estas regras para montar o formulário dinâmico.

### WeightRule

Define pesos por relação, departamento e categoria.

Campos sugeridos:

```text
id
cycle_id
relationship_type
same_department_weight
cross_department_weight
category_weight
created_at
updated_at
```

Notas:

- Pesos podem ser globais ou configuráveis por ciclo.
- A decisão final sobre pesos globais ou por ciclo ainda está em aberto.

### CommentMessage

Representa o comentário final opcional.

Campos sugeridos:

```text
id
evaluation_id
content
visible_to_evaluatee
created_at
updated_at
```

Notas:

- Este campo não entra no cálculo do score.
- Deve ser visível ao avaliado quando os resultados forem publicados.
- Deve ser visível a administradores autorizados.
- Pode ser moderado, ocultado ou auditado, dependendo da política final.

### RetentionPolicy

Define retenção e exportação.

Campos sugeridos:

```text
id
name
evaluations_visible_until_offset
exports_allowed_until_offset
raw_data_retention_until_offset
anonymized_summary_retention_until_offset
created_at
updated_at
```

Notas:

- Disponibilidade na aplicação e permissão de exportação são coisas diferentes.
- Exemplo: avaliações visíveis por 5 anos, exportação permitida por 1 ano.

### AuditLog

Regista eventos sensíveis.

Campos sugeridos:

```text
id
actor_id
action
resource_type
resource_id
metadata
ip_address
created_at
```

Eventos mínimos a auditar:

```text
admin_viewed_identified_evaluation
admin_exported_results
cycle_created
cycle_opened
cycle_closed
results_published
retention_policy_changed
assignment_manually_changed
evaluation_admin_edited
```

### NotificationLog

Regista notificações enviadas.

Campos sugeridos:

```text
id
cycle_id
user_id
type
channel
sent_at
status
error
created_at
```

Tipos de notificação:

```text
cycle_opened
evaluation_pending
cycle_closing_soon
cycle_last_day
results_published
admin_pending_actions
```

## Relações principais

```text
User belongs to Department
User has Role
User has HierarchyLevel
User may have manager User

Cycle has many EvaluationAssignments
Cycle has many Evaluations

EvaluationAssignment belongs to Cycle
EvaluationAssignment has evaluator User
EvaluationAssignment has evaluatee User

EvaluationSubmission belongs to EvaluationAssignment
EvaluationSubmission has many EvaluationAnswers
EvaluationSubmission has many EvaluationRevisions

Dimension has many Criteria
Criterion has many CriterionOptions

ApplicabilityRule may target Dimension or Criterion
WeightRule belongs to Cycle
RetentionPolicy may be used by many Cycles
```

## Regras de integridade essenciais

```text
User cannot evaluate self.
User cannot evaluate superior.
Only assigned evaluator/evaluatee pairs can produce evaluations.
One evaluator can evaluate the same evaluatee only once per cycle.
Closed cycles block normal edits.
Published results should not be recalculated without administrative audit.
N/A answers do not enter scoring.
Non-applicable criteria do not enter scoring.
```

## Regras administrativas base

As entidades estruturais iniciais (`Department`, `HierarchyLevel`, `Role` e
`User`) têm CRUD administrativo no backend para permitir configuração do MVP.
Estas operações ainda não substituem regras futuras de RBAC.

Regras mínimas:

```text
Department.name is unique.
Department.parent_department_id must reference an existing Department when set.
Department cannot be deleted while it has users, roles, or child departments.

HierarchyLevel.name is unique.
HierarchyLevel.rank is unique and must be a positive integer.
HierarchyLevel cannot be deleted while it has users or roles.

Role.department_id must reference an existing Department when set.
Role.hierarchy_level_id must reference an existing HierarchyLevel when set.
Role cannot be deleted while it has users.

User.workspace_email is unique.
User.google_sub is treated as unique when set.
User relation ids must reference existing records when set.
User.manager_id cannot point to the same User.
User cannot be deleted while assigned as manager of other users.
```

## Observação final

Este modelo é conceitual. O schema Prisma pode ajustar nomes, enums, índices e relações, mas não deve quebrar as regras centrais descritas aqui.

### Scoring Engine Output
A pontuação não é armazenada na base de dados, sendo calculada de forma on-the-fly pelo `ScoringService`.
As saídas incluem:
- `score`: O resultado final da média ponderada em formato numérico.
- `scoredAnswerCount`: O número de respostas com pontuação > 0, utilizado para cálculo do threshold.
- `naAnswerCount`: Respostas não aplicáveis (`null`) ou em branco, ignoradas nas médias.
- `validSubmissionCount`: Número de submissões concluídas que continham pelo menos uma resposta com pontuação real.
- `minimumResponseThresholdMet`: Um boolean (baseado em validSubmissionCount >= 3) que indicará a elegibilidade de visibilidade na fase posterior.
