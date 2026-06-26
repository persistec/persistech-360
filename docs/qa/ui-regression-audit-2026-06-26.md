# Auditoria de Regressões Visuais e Matriz Mobile-First
**Referência:** Issue #57
**Data da Auditoria:** 2026-06-26
**Estado:** Diagnóstico e Documentação (Nenhuma alteração de código aplicada)

---

## 1. Resumo Executivo

Esta auditoria de garantia de qualidade visual foi realizada para inspecionar, reproduzir e documentar as regressões na interface gráfica do utilizador (UI) no portal operacional do **Persistech 360**. O foco principal consistiu em avaliar o comportamento adaptativo do layout sob uma perspetiva *mobile-first*, identificando quebras de layout, sobreposição de elementos fixos, problemas de legibilidade, scroll traps e falhas de usabilidade no formulário de departamentos.

Os diagnósticos confirmam que o portal operacional atual sofre de severas limitações de usabilidade em ecrãs móveis devido ao acúmulo de elementos informativos fixos e cartões redundantes no topo da página. A área útil resultante em ecrãs como os de 390px e 430px inviabiliza a operação do sistema. 

Este documento serve como a especificação técnica e o roteiro de correções recomendadas para as próximas iterações de desenvolvimento na UI da plataforma.

---

## 2. Matriz de Comportamento por Viewport

A tabela abaixo resume o comportamento visual observado e a integridade de layout da aplicação em diferentes larguras de ecrã:

| Viewport | Tipo de Dispositivo | Comportamento Observado | Estado de Layout / Problemas |
| :--- | :--- | :--- | :--- |
| **390px** | Mobile Pequeno (ex: iPhone SE / 12 mini) | Crítico. A Sidebar móvel (~180px) em conjunto com o `OperationalShellHeader` sticky (~350px) consomem mais de 530px verticais. A área útil para os formulários/tabelas é inferior a 150px. Cartões colapsam verticalmente e o texto do ciclo ativo fica espremido. | **Inaceitável** (Bloqueio de uso) |
| **430px** | Mobile Moderno (ex: iPhone Pro Max / Galaxy S Ultra) | Semelhante ao ecrã de 390px. Os cartões informativos ocupam a totalidade da largura em coluna única, forçando um scroll excessivo. A barra de navegação horizontal carece de indicações de scroll. | **Inaceitável** (Bloqueio de uso) |
| **768px** | Tablet Vertical (ex: iPad mini / Air) | Layout transita para coluna única de shell, mas sem a sidebar móvel do topo (que ainda se mantém visível na regra `xl:hidden`). A quebra de texto nos cartões do header melhora ligeiramente, mas o volume vertical do cabeçalho ainda é excessivo. | **Regular** (Apresenta poluição visual) |
| **1024px** | Desktop Pequeno / Tablet Horizontal | O ecrã ainda oculta a sidebar lateral (pois o breakpoint está em `xl` / 1280px). O cabeçalho e a barra do topo competem por espaço vertical. A visualização de tabelas largas gera scrollbars horizontais. | **Regular** (Usável, mas com fricção) |
| **1280px** | Desktop Padrão | Transição completa para o layout de duas colunas (Sidebar lateral à esquerda, largura fixa de `20rem`). O cabeçalho é horizontalizado. Ocorre quebra agressiva de texto no card "Ciclo Activo" devido ao limite rígido de `xl:w-[34rem]`. | **Bom** (Usável, com pequenos bugs de wrap) |

---

## 3. Ficheiros Inspecionados

Os seguintes ficheiros fundamentais da arquitetura do frontend foram inspecionados:
1. [OperationalShellHeader.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/OperationalShellHeader.tsx): Responsável pelo cabeçalho da aplicação, cartões informativos e breadcrumbs.
2. [Sidebar.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/Sidebar.tsx): Responsável pela navegação lateral em ecrãs grandes e barra de navegação/resumo móvel em ecrãs pequenos.
3. [layout.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/app/layout.tsx): Estrutura global do documento e definição de áreas de scroll (`overflow-y-auto`).
4. [globals.css](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/app/globals.css): Sistema de temas (claro/escuro) e importação do Tailwind CSS v4.
5. [page.tsx (departments)](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/app/departments/page.tsx): Página de departamentos, incluindo a tabela de listagem e o formulário de criação/edição.

---

## 4. Diagnóstico Detalhado das Regressões

### Item A: Cabeçalho Operacional com Quebra Agressiva de Texto
* **Problema Observado:** Texto esmagado e quebras de linha inapropriadas nos cartões superiores em ecrãs desktop padrão (1280px).
* **Evidência:** O container do grid de cartões está limitado a `xl:w-[34rem]` (544px) na linha 28 de `OperationalShellHeader.tsx`. Dividido em duas colunas (`md:grid-cols-2`), cada cartão tem no máximo 272px de largura. Dentro do card "Ciclo Activo", o título `"Ciclo de Avaliação 2026"` e o `StatusBadge` `"Referência operacional"` são dispostos em linha (`sm:flex-row`). Como o badge tem largura significativa, o título é empurrado e quebra agressivamente em múltiplas linhas verticais.
* **Ficheiro Suspeito:** [OperationalShellHeader.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/OperationalShellHeader.tsx#L28-L41)
* **Causa Provável:** Uso de largura rígida (`xl:w-[34rem]`) em combinação com `flex-row` sem wrapping flexível ou sem colapso condicional do badge em ecrãs médios/grandes onde a largura do cartão é reduzida.
* **Risco:** Falha de conformidade de design visual, aspeto não profissional da UI e problemas de leitura de dados de controle de ciclos.
* **Issue Recomendada para Correção:** `fix(ui): reestruturar grid e layout de cartões do cabeçalho operacional para evitar quebras de texto`

---

### Item B: Card "Ciclo Activo" Ilegível e Redundante
* **Problema Observado:** Poluição informativa e duplicação desnecessária de cartões informativos no mobile.
* **Evidência:** No mobile (< 1280px), o utilizador visualiza primeiro o card do Ciclo Activo no topo da Sidebar (linhas 24-31). Logo a seguir, no cabeçalho operacional (linhas 29-41), o mesmo card é renderizado novamente com uma descrição longa: `"Indicador estático do shell; não vem da API em tempo real."` que devia ser apenas uma anotação de desenvolvimento. O excesso de texto e a redundância prejudicam o fluxo visual.
* **Ficheiros Suspeitos:**
  - [Sidebar.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/Sidebar.tsx#L24-L31)
  - [OperationalShellHeader.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/OperationalShellHeader.tsx#L29-L41)
* **Causa Provável:** Falta de diferenciação de estados e responsabilidades visuais entre o cabeçalho e a barra móvel, resultando em duplicação direta de componentes.
* **Risco:** Frustração do utilizador por duplicação de dados e desperdício de viewport útil.
* **Issue Recomendada para Correção:** `fix(ui): consolidar informações do ciclo ativo e remover duplicação no fluxo mobile`

---

### Item C: Sidebar/Nav a Comprometer a Área Útil no Mobile
* **Problema Observado:** Falta de ecrã utilizável no mobile devido ao acúmulo de cabeçalhos e menus fixados verticalmente.
* **Evidência:** Em viewports de 390px e 430px, o menu da Sidebar móvel ocupa ~180px e o `OperationalShellHeader` (que é `sticky top-0 z-20`) ocupa ~350px. Juntos, consomem ~530px de altura visual fixa. Num telemóvel padrão, a janela do navegador útil tem cerca de 650px-700px. A área livre para o formulário ou tabela é inferior a 150px, tornando impossível preencher dados ou visualizar listagens de forma confortável.
* **Ficheiros Suspeitos:**
  - [layout.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/app/layout.tsx#L48-L56)
  - [Sidebar.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/Sidebar.tsx#L16-L53)
  - [OperationalShellHeader.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/OperationalShellHeader.tsx#L13-L56)
* **Causa Provável:** O cabeçalho operacional é configurado como `sticky` em ecrãs móveis sem colapsar os cartões secundários ou a descrição da página. A sidebar móvel também exibe elementos estáticos pesados em vez de ocultá-los sob um menu hamburger.
* **Risco:** Inutilização prática do sistema em dispositivos móveis, violando a premissa de matriz adaptada e responsiva para colaboradores em trânsito.
* **Issue Recomendada para Correção:** `fix(ui): otimizar navegação móvel e cabeçalho operacional para viewports responsivas`

---

### Item D: Overflow Horizontal Global
* **Problema Observado:** Risco de overflow horizontal no ecrã inteiro e ausência de sinalização para navegações horizontais intencionais.
* **Evidência:** O menu móvel horizontal (`<nav className="flex min-w-0 gap-2 overflow-x-auto pb-1">`) permite scroll horizontal dos botões de link, mas não exibe qualquer indicação visual (sombreamento ou fade) de que existem mais páginas ocultas à direita. Além disso, a tabela de departamentos possui uma coluna de "Acções" larga (com botões "Editar" e "Eliminar" inline) que empurra a tabela e pode estourar o ecrã se não for contida.
* **Ficheiros Suspeitos:**
  - [Sidebar.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/Sidebar.tsx#L32-L52)
  - [table.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/ui/table.tsx#L12)
* **Causa Provável:** Falta de máscaras gradientes nos limites da navegação horizontal com overflow e botões dispostos horizontalmente sem wrapping em resoluções estreitas.
* **Risco:** Funcionalidades importantes (como outras abas de navegação ou ações da tabela) ficam "invisíveis" ou inacessíveis para utilizadores menos experientes.
* **Issue Recomendada para Correção:** `fix(ui): adicionar indicadores visuais de scroll horizontal e colapsar ações de tabela no mobile`

---

### Item E: Scroll Traps no Layout
* **Problema Observado:** Conflito de rolagens verticais que causam travamento de navegação ao usar o rato ou gestos táteis.
* **Evidência:** O layout global define `overflow-hidden` no ecrã inteiro (`h-dvh`) e delega o scroll para a div do conteúdo principal com `overflow-y-auto` (linha 50 de `layout.tsx`). No entanto, a Sidebar também possui o seu próprio container de scroll vertical `overflow-y-auto` (linha 66). Em ecrãs pequenos ou laptops com resoluções reduzidas, o utilizador pode ter o rato capturado pela Sidebar, impedindo a rolagem natural da página.
* **Ficheiros Suspeitos:**
  - [layout.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/app/layout.tsx#L48-L56)
  - [Sidebar.tsx](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/components/Sidebar.tsx#L66)
* **Causa Provável:** Definição de múltiplos fluxos de scroll vertical paralelos sem restrição de altura responsiva.
* **Risco:** Frustração de navegação física, com a página a parecer "travada" ao tentar rolar.
* **Issue Recomendada para Correção:** `fix(ui): eliminar scroll traps e rever z-index e sticky offsets do layout`

---

### Item F: Falhas de Usabilidade e Hierarquia no Formulário de Departamentos
* **Problema Observado:** Risco de dependência circular no cadastro de departamentos e layout apertado de botões no mobile.
* **Evidência:** Ao editar um departamento, o campo de seleção de "Departamento ascendente" filtra apenas o próprio departamento (`department.id !== formData.id` na linha 182). Se o departamento A for pai do departamento B, o utilizador pode editar o departamento A e selecionar o departamento B como ascendente, gerando uma referência circular inválida que quebrará a renderização em árvore. Adicionalmente, os botões "Guardar" e "Cancelar" não empilham no mobile, sendo espremidos horizontalmente.
* **Ficheiro Suspeito:** [page.tsx (departments)](file:///c:/Users/Bartolomeu%20Hangalo/dev/persistech-360/apps/web/src/app/departments/page.tsx#L172-L204)
* **Causa Provável:** Ausência de verificação recursiva de descendentes no array de opções do dropdown e falta de flexibilidade responsiva no componente `ActionBar` para empilhar botões no mobile.
* **Risco:** Corrupção lógica da árvore organizacional (erros de integridade de dados e loops de renderização infinitos) e botões de formulário inacessíveis no mobile.
* **Issue Recomendada para Correção:** `fix(ui): implementar validação hierárquica e otimizar ações do formulário de departamentos`

---

## 5. Riscos Técnicos e de Negócio

1. **Adoção e Rejeição do MVP:** Caso os colaboradores tentem preencher as avaliações a partir de telemóveis e se deparem com ecrãs sem área útil visível, o índice de submissões no ciclo cairá drasticamente.
2. **Integridade de Dados da Organização:** A possibilidade de dependência circular na hierarquia de departamentos pode causar travamentos globais de relatórios e de processamento de pontuações ponderadas no backend.
3. **Falta de Acessibilidade (a11y):** A quebra agressiva de texto e o esmagamento de badges dificultam ou impossibilitam a leitura por leitores de ecrã ou utilizadores com baixa visão.

---

## 6. Ordem Recomendada de Correção

Propõe-se a seguinte ordem de execução para as correções visuais, priorizando a estabilidade estrutural:

1. **Fase 1: Estrutura do Layout e Scroll Traps**
   - Corrigir a estrutura de scroll no `layout.tsx` e unificar a navegação móvel de forma a libertar espaço útil.
2. **Fase 2: Consolidação de Cartões e Cabeçalho**
   - Ajustar o `OperationalShellHeader.tsx` para colapsar cartões em resoluções inferiores a 1280px e remover a duplicação do "Ciclo Activo" no mobile.
3. **Fase 3: Tabelas e Overflow Horizontal**
   - Aplicar indicadores visuais de rolagem horizontal na Sidebar móvel e colapsar ações da tabela de departamentos em menus suspensos (dropdown).
4. **Fase 4: Formulários e Usabilidade**
   - Ajustar o formulário de departamentos para empilhar ações e implementar a validação recursiva que previne dependências circulares.

---

## 7. Critérios Mínimos para Aceitação de PRs de UI

Futuros Pull Requests que alterem elementos da UI devem respeitar rigorosamente as seguintes diretrizes:

1. **Validação Multi-Viewport:** O autor do PR deve provar que a alteração foi testada e permanece legível nas larguras de 390px, 430px, 768px, 1024px e 1280px.
2. **Sem Duplicação Informativa:** Nenhuma informação operacional de cabeçalho ou ciclo deve ser duplicada de forma estática no mobile.
3. **Empilhamento de Ações:** Botões de formulário devem empilhar verticalmente em ecrãs menores de 640px.
4. **Respeito ao Checklist Geral:** Validação obrigatória dos comandos `lint` e `build` locais, além da integridade UTF-8 livre de marcas BOM e Mojibakes.
