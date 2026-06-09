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
- Após o fecho do ciclo, utilizadores comuns não podem editar avaliações.
- Administradores autorizados podem consultar registos completos.
- Avaliados não podem ver a identidade dos avaliadores.

## Cadastros administrativos base

Os cadastros administrativos de departamentos, níveis hierárquicos, cargos e
utilizadores são mantidos pelo backend como fundação do domínio. Estes endpoints
não implementam autenticação ou autorização ainda, mas já devem validar dados e
relações no servidor.

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

### Categorias departamentais

Aplicam-se apenas quando o avaliador tem contexto adequado.

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

No escopo atual, subordinados não avaliam chefias.

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

A opção `N/A` não entra no cálculo.

## Comentário final aberto

Cada avaliação pode incluir um único comentário final opcional.

Regras:

* visível ao avaliado;
* visível a administradores autorizados;
* não entra no cálculo do score;
* deve ser profissional e relacionado ao trabalho;
* pode ser moderado ou auditado em caso de abuso.

## Mínimo de respostas

Se um avaliado receber menos de três avaliações válidas, resultados detalhados não devem ser publicados para esse avaliado.

Mensagem recomendada:

```text
Dados insuficientes para consolidação.
```

Administradores autorizados continuam a poder consultar os registos internos.

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
