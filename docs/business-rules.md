# Regras de negócio

## Definição do produto

O sistema não é uma plataforma de votação.

É um sistema de avaliação 360º adaptada, baseado em ciclos formais de avaliação.

## Regras centrais

- Colaboradores não podem avaliar a si próprios.
- Colaboradores não podem avaliar superiores hierárquicos.
- Colaboradores podem avaliar colegas diretos quando elegíveis.
- Gestores podem avaliar subordinados diretos ou indiretos.
- Avaliações entre departamentos diferentes são permitidas apenas para categorias gerais.
- Critérios técnicos ou departamentais só aparecem quando o avaliador tem contexto suficiente.
- Enquanto o ciclo estiver aberto, avaliações submetidas podem ser editadas.
- Após o fecho do ciclo ou após submissão final, utilizadores comuns não podem editar avaliações.
- Administradores autorizados podem consultar registos completos.
- Avaliados não podem ver a identidade dos avaliadores.
- Submissões requerem que a assignment esteja no status `pending` e o ciclo em `open` ou `closing_soon`.
- Apenas rascunhos (onde `submitted_at` não está preenchido) podem ser atualizados. A submissão é uma ação final e irreversível pelo utilizador.

## Cadastros administrativos base

Os cadastros administrativos de departamentos, níveis hierárquicos, cargos e
utilizadores são mantidos pelo backend como fundação do domínio.

A partir de agora, estes endpoints (mutações e consultas administrativas) exigem autenticação via header `x-user-id` e validação de permissões baseada no campo `AppRole` (ADMIN ou EMPLOYEE). Mutações estruturais estão restritas ao nível ADMIN.

Regras:

- `Department.name` é obrigatório e único.
- `Department.parentDepartmentId` é opcional, mas deve referenciar um departamento existente quando informado.
- Departamentos não podem ser removidos enquanto tiverem departamentos filhos, utilizadores ou cargos associados.
- `HierarchyLevel.name` e `HierarchyLevel.rank` são obrigatórios e únicos.
- `HierarchyLevel.rank` deve ser um inteiro positivo.
- Níveis hierárquicos não podem ser removidos enquanto forem usados por utilizadores ou cargos.
- `Role.name` é obrigatório.
- `Role.departmentId` e `Role.hierarchyLevelId` são opcionais, mas devem referenciar registos existentes quando informados.
- Cargos não podem ser removidos enquanto forem usados por utilizadores.
- `User.workspaceEmail` é obrigatório e único.
- `User.googleSub` é opcional e único quando informado.
- `User.departmentId`, `roleId`, `hierarchyLevelId` e `managerId` são opcionais, mas devem referenciar registos existentes quando informados.
- Um utilizador não pode ser definido como seu próprio gestor.
- Utilizadores não podem ser removidos enquanto forem gestores de outros utilizadores.

## Categorias de avaliação

### Categorias corporativas gerais

Podem aplicar-se entre departamentos:

- colaboração;
- comunicação;
- responsabilidade;
- cumprimento de prazos;
- disponibilidade;
- postura profissional;
- parceria interna;
- alinhamento com valores da empresa;
- capacidade de trabalhar com outros departamentos.

O motor de aplicabilidade permite estas categorias por predefinição. Caso existam regras explícitas (ex: restrições de nível hierárquico), o avaliador terá de cumprir pelo menos uma regra para ter acesso ao critério.

### Categorias departamentais

Aplicam-se apenas quando o avaliador tem contexto adequado.
Por padrão, o motor de aplicabilidade exige que o avaliador e o avaliado pertençam ao mesmo departamento.
O contexto inter-departamental (cross-department) só é validado caso exista uma regra de aplicabilidade explícita a permiti-lo.

Exemplos para TI:

- resolução de problemas;
- qualidade técnica percebida;
- documentação;
- autonomia técnica;
- cumprimento de processos técnicos;
- escalonamento correto.

Exemplos para Comercial:

- acompanhamento de clientes;
- precisão nas propostas;
- comunicação com clientes;
- cumprimento do funil comercial;
- relacionamento pós-venda.

### Categorias de liderança

Aplicam-se apenas a colaboradores em funções de liderança e apenas quando o avaliador é elegível para avaliar esse tipo de competência.

O motor de aplicabilidade deteta um contexto de liderança verificando se o avaliado possui outros colaboradores ativos associados a si (subordinados diretos com `status: ACTIVE`). Se o avaliado não possuir subordinados, os critérios de liderança nunca são aplicados.

No escopo atual, subordinados não avaliam chefias. Esta restrição pode ser configurada usando a regra `blocked_if_evaluatee_above_evaluator` no critério ou dimensão. O sistema cruza os `rank` dos níveis hierárquicos para o garantir (ranks maiores = níveis mais altos).

## Escala de resposta

Escala recomendada:

```text
1 - Muito abaixo do esperado
2 - Abaixo do esperado
3 - Dentro do esperado
4 - Acima do esperado
5 - Muito acima do esperado
N/A - Não tenho informação suficiente
````

A opção `N/A` não entra no cálculo. Na API, respostas N/A são registadas com o envio de `criterionOptionId = null` quando o modelo de dados permitir que esta intencionalidade seja diferenciada da ausência de resposta, sendo aceite no rascunho como abstensão até ao submit.

## Comentário final aberto

Cada avaliação pode incluir um único comentário final opcional.

Regras:

* visível ao avaliado;
* visível a administradores autorizados;
* não entra no cálculo do score;
* deve ser profissional e relacionado ao trabalho;
* pode ser moderado ou auditado em caso de abuso.

## Mínimo de respostas

Se um avaliado receber menos de três avaliações válidas, resultados detalhados não devem ser publicados para esse avaliado. Na visão do colaborador (Evaluated Employee View), isto traduz-se no retorno de um status `insufficient_responses`, com pontuação nula (`score: null`), ocultação total de métricas de dimensões e critérios (arrays vazios) e ocultação de comentários.

Mensagem recomendada:

```text
Dados insuficientes para consolidação.
```

Administradores autorizados continuam a poder consultar os registos internos através da Admin View, que não anonimiza o detalhe (embora não exponha identificadores brutos).

## Anonimização

- Avaliados não podem ver a identidade dos avaliadores.
- Não devem ser expostos em endpoints direcionados aos colaboradores o `evaluatorId`, `assignmentId`, `submissionId` nem `relationships` (pontuações agrupadas por relação/departamento, por poderem facilitar a dedução de quem avaliou o quê).
- Comentários finais estão, de momento, omitidos das visualizações como mecanismo de precaução até haver implementação robusta contra quebras de anonimato.

## Cálculo ponderado

Fórmula conceitual:

```text
score_final =
  soma(score_resposta × peso_pergunta × peso_categoria × peso_relação)
  /
  soma(peso_pergunta × peso_categoria × peso_relação)
```

Perguntas não aplicáveis e respostas `N/A` ficam fora do denominador.

## Estados do ciclo

```text
draft
scheduled
open
closing_soon
closed
results_published
archived
```

## Fluxo do ciclo

1. Administrador cria o ciclo.
2. Administrador define datas, categorias, critérios, regras e política de retenção.
3. Sistema gera matriz de elegibilidade.
4. Administrador revê e ajusta a matriz.
5. Ciclo é aberto.
6. Colaboradores recebem notificações.
7. Avaliadores submetem avaliações.
8. Avaliadores podem editar enquanto o ciclo estiver aberto.
9. Sistema envia lembretes.
10. Ciclo fecha.
11. Sistema consolida resultados.
12. Administrador revê consistência.
13. Resultados são publicados.
14. Dados seguem política de retenção e exportação.

## Regras de Geração de Atribuições

Na geração automática de atribuições, o sistema segue as seguintes diretivas:
- **Utilizadores Ativos**: Apenas colaboradores com estado ativo entram no processo.
- **Deduplicação**: Atribuições já existentes não são recriadas nem duplicadas.
- **same_department_peer**: Gera atribuições entre colaboradores do mesmo departamento e com o mesmo nível hierárquico, excluindo autoavaliações.
- **manager_to_subordinate**: Gera atribuição de avaliação do gestor direto (`managerId` definido em `User`) para o seu subordinado.
- **Subordinado avalia superior**: Fica expressamente bloqueado; nenhum subordinado avalia o seu superior hierárquico (seja por chefia direta ou por rank hierárquico maior).
- **cross_department_peer**: Não é gerado de forma automática (mantido como pendente/manual nesta fase).

## Cálculo de Resultados (Scoring)

1. **Inclusão de Dados**: Apenas respostas provenientes de submissões concluídas (`submittedAt IS NOT NULL`) e associadas a assignments concluídos (`status: completed`) são contabilizadas. Comentários finais são ignorados.
2. **N/A e Respostas Nulas**: Respostas não aplicáveis (`scoreValueSnapshot = null`) são removidas do numerador e denominador das médias para não distorcer resultados, sendo apenas contabilizadas na métrica `naAnswerCount`.
3. **Fórmula Nível Critério**: Média ponderada usando os pesos do `WeightRule` (baseado no `relationshipType` e de departamento). O peso do próprio critério não é aplicado nesta fase para evitar distorções internas.
4. **Fórmula Nível Dimensão**: Média ponderada das pontuações dos critérios internos multiplicados pelo peso de cada critério (`Criterion.weight`).
5. **Fórmula Geral do Avaliado**: Média ponderada das pontuações das dimensões multiplicadas pelo peso de cada dimensão (`Dimension.weight`).
6. **Mínimo de Respostas**: Existe um limiar mínimo de avaliação (`minimumResponseThreshold` = 3). O motor exporta uma contagem de submissões válidas (com > 0 respostas pontuadas) e uma flag (`minimumResponseThresholdMet`) para posterior utilização nas regras de visibilidade.
