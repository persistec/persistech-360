# Checklist de QA Visual - Persistech 360

Este documento estabelece o checklist de Garantia de Qualidade (QA) Visual obrigatório para todas as alterações na interface do utilizador (UI) do Persistech 360.

---

## 1. Purpose (Objetivo)

Este checklist é de uso obrigatório antes de realizar o merge de qualquer Pull Request (PR) relacionado com o frontend ou com a interface gráfica do utilizador. Ele garante a consistência visual, a conformidade de acessibilidade, o suporte a múltiplos temas, a correção de tradução no português de Angola (PT-AO), e a integridade de codificação UTF-8 em toda a plataforma.

---

## 2. When to Use (Quando Usar)

Este checklist deve ser aplicado a qualquer Pull Request que altere ficheiros nos seguintes caminhos ou categorias:
* `apps/web/src/app`
* `apps/web/src/components`
* `apps/web/src/lib`
* `apps/web/src/app/globals.css`
* Alterações de cópia visual (textos), temas, layout do operational shell, relatórios, formulários, tabelas, fluxos de avaliação ou visualizações de resultados.

---

## 3. Mandatory Commands (Comandos Obrigatórios)

Antes de submeter o PR, execute os seguintes comandos no terminal a partir da raiz do repositório para garantir que o código compila corretamente e não viola regras de integridade ou estilo:

```bash
cd apps/web
npm run lint
npm run build
cd ../..
git diff --check
git status -s
git diff --stat
```

---

## 4. Encoding and UTF-8 Guard (Guarda de Codificação e UTF-8)

Para evitar Mojibake (caracteres corrompidos) e marcas BOM (Byte Order Mark), execute o seguinte scanner de validação no terminal:

```bash
node -e "const fs=require('fs');const path=require('path');const bad=/[ÃÂ]/;let failed=false;function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);const s=fs.statSync(p);if(s.isDirectory())walk(p);else if(/\.(ts|tsx|js|jsx|css|md)$/.test(p)){const t=fs.readFileSync(p,'utf8');if(t.charCodeAt(0)===0xFEFF){console.log('BOM:',p);failed=true;}if(bad.test(t)){console.log('MOJIBAKE:',p);failed=true;}}}}walk('apps/web/src');if(failed)process.exit(1);console.log('OK');"
```

> [!IMPORTANT]
> **Atenção:** O scanner acima deve ser executado especificamente contra a diretoria `apps/web/src`, não contra o repositório inteiro. Isto previne falsos positivos provocados pelos padrões de pesquisa declarados neste próprio ficheiro de checklist.
>
> **Resultado Esperado:** O comando deve retornar estritamente:
> ```text
> OK
> ```

---

## 5. Text and Language Checklist (Checklist de Texto e Idioma)

### Regras Gerais
* **Idioma da UI:** Toda a cópia visível na interface do utilizador deve utilizar estritamente o Português de Angola (PT-AO) (ex: "Actualizar", "Eliminar", "Ficha de desempenho").
* **Sem Mojibake:** Não são tolerados caracteres com acentuação corrompida.
* **Resíduos de Inglês:** Nenhum termo em inglês deve estar visível para o utilizador final.
* **Identificadores Internos:** Os identificadores em TypeScript/JavaScript (nomes de variáveis, propriedades de APIs, bases de dados) podem e devem permanecer em inglês para manter o padrão técnico.
* **Corpo do PR:** Quando o corpo do PR contiver Markdown complexo ou múltiplos blocos de código com acentos/backticks, utilize a opção `--body-file` com UTF-8 sem BOM para evitar problemas de codificação na criação do PR.

### Termos Recomendados (PT-AO)
Utilize estes termos para a interface do utilizador:
* Painel
* Pontuação
* Pontuação global
* Relatório individual 360°
* Ficha de desempenho
* Classificação
* Métricas por dimensão
* Radar de competências
* Evolução trimestral
* Plano de desenvolvimento
* Próximo passo recomendado
* Guardar
* Cancelar
* Criar
* Actualizar
* Eliminar
* Submeter
* Rascunho
* A carregar
* Erro
* Sucesso
* Indisponível
* A definir

### Termos a Evitar (UI Visível)
Não utilize estes termos na interface pública (embora possam existir no código interno/identificadores):
* Dashboard
* Score
* Performance
* MVP
* Save
* Cancel
* Create
* Update
* Delete
* Submit
* Draft
* Loading
* Error
* Success

---

## 6. Icons and Visual Language (Ícones e Linguagem Visual)

* **Biblioteca Única:** Utilize exclusivamente ícones vindos da biblioteca `react-icons`.
* **Sem Emojis na UI:** Não utilize emojis gráficos nativos em texto da UI (ex: 📊, 🗓️, ✅).
* **Acessibilidade de Ícones Decorativos:** Ícones puramente decorativos devem conter `aria-hidden="true"`.
* **Controles Baseados Apenas em Ícones:** Botões ou links que contêm apenas ícones devem obrigatoriamente possuir uma propriedade `aria-label` descritiva em PT-AO.
* **Feedback Multimodal:** Mensagens de estado e feedback não podem depender unicamente de cores; devem incluir texto descritivo e ícones auxiliares acessíveis.

### Comandos de Verificação (Grep Checks)
Use estes comandos na raiz para auditar emojis e termos proibidos inseridos na interface:

```bash
git grep -n -I "📊\|🗓️\|✍️\|👥\|📈\|⚙️\|✅\|❌\|⚠️\|🚀\|💡\|🔍\|📝\|👤\|🏢\|🎯\|⭐\|🔥\|📁\|📌\|🔐\|🔔\|📄" -- apps/web/src || true
git grep -n -I "Dashboard\|Score\|Performance\|MVP\|Save\|Cancel\|Create\|Update\|Delete\|Submit\|Draft\|Loading\|Error\|Success" -- apps/web/src || true
```

---

## 7. Theme Checklist (Checklist de Temas)

O Persistech 360 suporta múltiplos temas. Deve validar visualmente a aplicação nas seguintes opções:
* Claro (Light)
* Escuro (Dark)
* Automático (System)

### Regras:
* **Sem Hardcoding de Cores Escuras/Claras:** Evite usar classes utilitárias estáticas que forçam cores específicas, como `text-white` ou `bg-black` sem variação.
* **Contraste:** Garanta que não existam combinações ilegíveis de texto branco sobre fundo claro ou texto escuro sobre fundo escuro.
* **Tokens Semânticos:** Prefira sempre as variáveis e cores semânticas do sistema (CSS custom properties) adaptadas para temas.

### Comando de Verificação (Grep Check)
Audite classes suspeitas de hardcoding de cores com:

```bash
git grep -n -I "text-white\|bg-white\|bg-black\|text-gray-900\|dark:text-white\|dark:bg-" -- apps/web/src || true
```

---

## 8. Accessibility Checklist (Checklist de Acessibilidade - a11y)

* **Estados de Foco Visíveis:** Todos os elementos interativos focáveis por teclado devem exibir um anel de foco claro e contrastante.
* **Navegação por Teclado:** Deve ser possível navegar, abrir modais e executar todas as ações da página usando apenas `Tab`, `Shift + Tab`, `Enter` e `Space`.
* **Rótulos de Formulários:** Todos os campos de entrada (`input`, `select`, `textarea`) devem ter rótulos (`label`) explicitamente associados e legíveis.
* **Campos Obrigatórios:** Forneça aviso e feedback textual explícito para campos obrigatórios vazios ou inválidos.
* **Controles Desativados:** Botões ou opções desativadas devem explicar textualmente (por exemplo, via tooltip ou texto de apoio) a razão da indisponibilidade.
* **Feedback Visual Não Cromático:** O estado de erro, aviso ou sucesso de campos e alertas não deve ser distinguido apenas pela cor do elemento.
* **Leitura de Tabelas:** Garanta o uso de `thead`, `tbody`, `th` com o correto alinhamento visual e sem perda de contexto estrutural.

### Comando de Verificação (Grep Check)
Identifique se estados de foco estão a ser omitidos de forma incorreta:

```bash
git grep -n -I "outline-none\|focus:outline-none\|focus-visible:outline-none" -- apps/web/src || true
```

---

## 9. Responsive Checklist (Checklist de Responsividade)

Valide as páginas simulando as seguintes larguras mínimas de tela:
* **390px** (Mobile pequeno)
* **430px** (Mobile moderno/iPhone Pro Max)
* **768px** (Tablet vertical)
* **1024px** (Desktop pequeno/Tablet horizontal)
* **1280px** (Desktop padrão)

### Aspetos a Validar:
* **Menu Lateral (Sidebar):** O menu não deve comprimir o conteúdo principal nem sobrepor informações críticas de forma desordenada.
* **Navegação Móvel:** O menu móvel (hambúrguer ou gaveta) deve ser fácil de abrir, interagir e fechar.
* **Cartões de Cabeçalho (Header Cards):** Os cartões informativos não devem sobrepor texto ou truncar dados importantes.
* **Tabelas de Dados:** Tabelas devem ter transbordamento horizontal controlado (`overflow-x-auto`) ou colunas ocultáveis dinamicamente, sem quebrar o layout da página.
* **Formulários:** Inputs e botões devem empilhar de forma elegante em telas pequenas.
* **Seções de Relatório:** Gráficos e tabelas nos relatórios individuais de 360° não devem colapsar em colunas ilegíveis ou extremamente estreitas.

---

## 10. Pages to Review Before UI Merge (Páginas a Rever Antes do Merge)

Certifique-se de navegar e validar visualmente as seguintes telas da aplicação se forem impactadas pelas alterações:
* Painel (Dashboard)
* Departamentos
* Níveis Hierárquicos
* Funções
* Utilizadores
* Ciclos de Avaliação
* Atribuições
* Submissões
* Resultados
* Definições
* Relatório individual 360°
* Fluxos de resposta à avaliação (se houver e onde aplicável)

---

## 11. Component-Specific Checklist (Checklist de Componentes Específicos)

Valide o comportamento visual individual dos componentes afetados:
* `Sidebar` (Colapsada vs. Expandida)
* `OperationalShellHeader` (Breadcrumbs, dados do utilizador autenticado)
* `ThemeSwitcher` (Comutador e transição visual de cores)
* **Tabelas:** Paginação, ordenação e alinhamento de cabeçalhos.
* **Formulários:** Validação em tempo real, estados desativados e botões de ação ("Guardar" / "Cancelar").
* **Estados Vazios (Empty States):** Ilustrações sem emojis e mensagens claras de "Indisponível" ou "A definir".
* **Estados de Carregamento (Loading States):** Skeletons, spinners de carregamento, e mensagens adequadas (ex: "A carregar...").
* **Estados de Erro (Error States):** Telas de feedback claro, com possibilidade de tentar novamente.
* **Badges de Estado:** Cores acessíveis com contraste suficiente.
* **Espaços Reservados (Placeholders) de Relatório:** Representação correta de gráficos e tabelas quando não há dados.
* **Placeholder de Exportação de PDF:** Botão/opção desativado informando a limitação atual.

---

## 12. PR Review Checklist (Checklist de Revisão de Pull Request)

Antes de solicitar aprovação de merge no branch `dev`, o autor do PR deve confirmar:
* **Associação à Issue:** O PR deve referenciar a issue correspondente utilizando a sintaxe `Refs #...` (ou `Closes #...` apenas quando o branch de destino for a `main`).
* **Criação do PR com UTF-8:** O corpo do PR complexo foi carregado utilizando a flag `--body-file` a partir de um ficheiro UTF-8 sem BOM.
* **Média de Validação Visual:** O PR inclui capturas de tela (screenshots) ou vídeos demonstrativos das alterações visuais para temas claro e escuro.
* **Separação de Escopo:** Nenhuma alteração nas regras de negócio, API contratos, migrações de base de dados ou workflows de CI/CD está incluída num PR de frontend/UI.
* **Revisão no Navegador:** Se a revisão foi realizada num ambiente não local (ex: Vercel Preview) ou se o teste de navegador completo não pôde ser feito localmente, isso deve ser explicitado no corpo do PR.
