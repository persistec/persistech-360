# Decisões em aberto

## Decisões funcionais

- A chefia verá apenas agregados da equipa ou também resultados individuais dos subordinados?
- RH deve rever comentários finais antes de ficarem visíveis para os avaliados?
- RH poderá remover, ocultar ou moderar comentários abusivos?
- Os pesos serão globais ou configuráveis por ciclo?
- A publicação de resultados exigirá aprovação manual?
- O mínimo de avaliações válidas será exatamente três ou configurável?
- Quais formatos de exportação serão obrigatórios: PDF, Excel, Google Sheets ou todos?
- O avaliado poderá responder ao comentário final ou apenas recebê-lo?
- Haverá recurso ou revisão formal de avaliação?
- Ciclos serão trimestrais, semestrais ou configuráveis livremente?
- A direção terá acesso a dados identificados ou apenas relatórios executivos?
- Cross-department peer assignments: A geração automática de avaliações entre departamentos diferentes (cross_department_peer) está atualmente fora do motor de geração automática e é tratada como escopo futuro/criação manual.
- Applicabilidade na submissão: Full applicability engine validation by relationship/dimension at the answer level is deferred to the next phase.
- Critério N/A: `criterionOptionId` can be explicitly null se a intenção for N/A ou se o critério não tiver opções no futuro.

## Decisões Google Workspace

- O Google Workspace contém dados hierárquicos confiáveis?
- Departamentos estão representados por organizational units, grupos ou outro modelo?
- A empresa aprovará acesso ao Admin SDK?
- Domain-wide delegation será permitido?
- Qual domínio Workspace será aceite no login?
- Haverá múltiplos domínios ou aliases corporativos?
- O envio de emails será feito via Gmail API, SMTP autorizado ou serviço transacional externo?
- A sincronização de utilizadores será automática, manual ou híbrida no MVP?

## Decisões técnicas

- Modelo final de hospedagem self-hosted após MVP.
- Modelo final de hospedagem PostgreSQL.
- Estratégia de observabilidade.
- Estratégia de backups.
- Estratégia de rollback.
- Necessidade de Redis ou fila antes do MVP.
- Uso ou não de cliente OpenAPI gerado no frontend.
- Estratégia de autenticação entre frontend e backend.
- Estratégia de armazenamento de exports.
- Estratégia para jobs recorrentes no MVP.
- Estratégia para logs estruturados.
- Estratégia para seed inicial de dados.

## Decisões CI/CD

- Política exata de branches.
- Se `main` faz deploy automático para staging.
- Se produção exige aprovação manual.
- Se PRs apenas com documentação executam markdown lint.
- Se haverá ambientes protegidos no GitHub.
- Quem pode aprovar deploy de produção.
- Se preview deployments serão criados para toda PR ou apenas por label/manual trigger.
- Como evitar deploys da Vercel fora do GitHub Actions.

## Decisões de segurança

- Quem pode assumir papel de RH admin?
- Quem pode assumir papel de system admin?
- Como auditar acesso de administradores técnicos?
- Por quanto tempo logs de auditoria serão retidos?
- Exports expirados serão apagados automaticamente?
- Dados antigos serão eliminados ou anonimizados?
- Comentários abusivos serão apenas ocultados ou também preservados para auditoria?
- Quais ações administrativas exigem confirmação adicional?
- Haverá trilha de auditoria visível para RH?

## Decisões de arquitetura em aberto

- Como escalar o motor de elegibilidade para organizações com > 10.000 colaboradores.
- Se o motor de regras será exposto ao frontend ou rodará 100% no servidor.
- Limitações do Motor de Aplicabilidade (Applicability Engine):
  - **Deteção de Liderança:** Apenas verificamos se o colaborador (evaluatee) possui outros colaboradores ativos que reportam a ele (`subordinates` com `status: ACTIVE`). Se o status de liderança estiver embutido apenas em nomeações ou títulos (ex: "Scrum Master") sem que haja colaboradores vinculados ao `managerId`, a liderança não é detetada de forma genérica no momento.
  - **Rank Hierárquico:** Presumimos que números maiores em `rank` representam posições mais altas na hierarquia (ex: 6 = Diretor, 1 = Estagiário). Avaliações onde o avaliado está "acima" do avaliador ocorrem quando `evaluatee.rank > evaluator.rank`. Se um dos utilizadores não tiver nível hierárquico, esta verificação é ignorada.
- Qual a estratégia de caching para o motor de elegibilidade.

## Decisões de produto

- Nome final do sistema.
- Identidade visual final.
- Idiomas suportados.
- Periodicidade padrão dos ciclos.
- Quem cria ciclos: RH, direção ou administradores técnicos?
- Quem publica resultados?
- Que métricas aparecem no dashboard inicial?
- Que informações aparecem no dashboard do colaborador?
- Que informações aparecem no dashboard administrativo?
- Que dados aparecem no relatório individual?

## Como tratar decisões em aberto

Antes de implementar uma funcionalidade afetada por uma decisão em aberto, a equipa deve:

1. identificar a decisão;
2. propor uma opção;
3. validar com responsável funcional;
4. atualizar este documento;
5. só depois implementar.

Isto evita que decisões importantes sejam tomadas escondidas dentro de código, que é o equivalente técnico de assinar contrato em guardanapo.
