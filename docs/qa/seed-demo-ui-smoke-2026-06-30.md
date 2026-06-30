# Relatório de Smoke Test Funcional e Visual — Dados Demo

**Data:** 2026-06-30  
**Autor:** Antigravity QA Agent  
**Ambiente:** Local API + Local Frontend  
**Base de Dados:** Neon Branch `seed-demo-validation` (descartável)  
**Host da Base de Dados:** `ep-bitter-mouse-acskbsdn-pooler.sa-east-1.aws.neon.tech` (Sanitizada)

---

## 1. Comandos Executados

### Backend
1. Configuração do `.env` apontando para a branch Neon `seed-demo-validation`.
2. Inicialização da API:
   ```bash
   npm run start
   ```
3. Verificação de Saúde (API e DB):
   ```bash
   curl.exe -s http://localhost:4000/api/v1/health
   # Retorno: {"status":"UP","timestamp":"...","database":"UP"}
   ```

### Frontend
1. Inicialização do servidor Next.js:
   ```bash
   npm run dev
   ```

---

## 2. Páginas e Fluxos Testados

### Viewports Inspecionados
* **Desktop (1280px)**: Sidebar estendida, layout completo.
* **Tablet (768px)**: Adaptação de grid e colunas.
* **Mobile (430px & 390px)**: Menu lateral adaptativo/hambúrguer, empilhamento correto e touch targets.

### Elementos Visuais e UX
* **Shell & Navegação**: Sidebar e cabeçalhos operacionais. Transições de rota suaves sem reloading.
* **Estilo & Contraste**: Tema premium preto/dourado com alto contraste e legibilidade.
* **Touch Targets & Focus**: Foco visível nos botões e inputs. Links de navegação e botões em mobile com padding adequado para toque.
* **Overflow**: Sem transbordo (overflow) horizontal em resoluções mobile.

---

## 3. Resultados e Bugs Encontrados

| ID | Descrição do Bug | Severidade | Impacto |
| :--- | :--- | :--- | :--- |
| **BUG-01** | **Mapeamento de Resposta da API Incompatível (Empty States)**<br>Todas as listagens da UI (Departamentos, Utilizadores, Cargos) exibem o estado vazio (Ex: *"Ainda não existem departamentos"*), apesar de o banco possuir os dados e a API retorná-los.<br><br>**Causa Raiz:** O frontend (`apiClient.get`) espera um wrapper `{ data: T[] }`, mas a API NestJS retorna um array plano diretamente (`T[]`). | **Crítica (Blocker)** | Impede a visualização de qualquer dado semeado (seed) ou criado. |

### Detalhes de Criação de Entidades (Ex: Departamentos)
* O formulário de criação de departamento foi submetido com sucesso.
* A chamada `POST /api/v1/departments` foi enviada com payload correto e respondeu com `201 Created`.
* A subsequente chamada `GET /api/v1/departments` retornou o novo item, porém a UI manteve o estado vazio devido ao **BUG-01**.

---

## 4. Recomendações e Próximas Issues

1. **Ajuste de Tipagem/Mapeamento no Frontend**:
   * Atualizar os serviços e páginas de listagem (`departments/page.tsx`, `users/page.tsx`, `roles/page.tsx`) para processar arrays diretos retornados pela API, ou adaptar o `api-client` comum para normalizar a resposta.
2. **Ciclos de Avaliação**:
   * Verificar se o módulo de Ciclos e Critérios partilha a mesma estrutura de consumo de dados e aplicar a correção de mapeamento.

---

## 5. Referência de Screenshots e Gravações Locais
Os registos visuais e a gravação de sessão Playwright encontram-se temporariamente armazenados no diretório da subconversação QA:
* Gravação: `C:\Users\Bartolomeu Hangalo\AppData\Local\Temp\antigravity\brain\269eef2a-d4a4-401d-9632-03f74580b681\recording.webm` (ou caminho correspondente)
* Screenshots Desktop & Mobile:
  * `dashboard_1280.png`
  * `dashboard_768.png`
  * `dashboard_430.png`
  * `dashboard_390.png`
