# Escopo do MVP

## Objetivo do MVP

O MVP deve permitir executar um ciclo real de avaliação 360º adaptada de ponta a ponta.

A prioridade é validar o domínio, as regras de elegibilidade, a submissão das avaliações, o cálculo ponderado, a publicação dos resultados e a auditoria administrativa.

O objetivo não é criar dashboards sofisticados antes de existir dado confiável. Essa é uma tentação comum, e normalmente termina em gráficos bonitos sobre lixo estatístico.

## Incluído no MVP

O MVP inclui:

- login com Google Workspace;
- mapeamento local de perfil de utilizador;
- gestão de departamentos;
- gestão de cargos;
- gestão de níveis hierárquicos;
- gestão de ciclos de avaliação;
- configuração de dimensões;
- configuração de critérios;
- configuração de opções de resposta;
- regras básicas de elegibilidade;
- geração de atribuições de avaliação;
- formulário dinâmico de avaliação;
- perguntas fechadas;
- um comentário final opcional;
- edição enquanto o ciclo está aberto;
- bloqueio após fecho do ciclo;
- cálculo ponderado;
- resultados agregados para o avaliado;
- limiar mínimo de avaliações válidas;
- painel administrativo;
- logs de auditoria;
- política de retenção;
- política de exportação;
- notificações por email;
- persistência em PostgreSQL;
- CI/CD seletivo;
- implantação provisória na Vercel.

## Fora do MVP

Fica fora do MVP:

- autoavaliação;
- avaliação ascendente de chefias por subordinados;
- sistema genérico de votação;
- integração com Google Chat;
- integração com Google Calendar;
- sínteses automáticas com IA;
- planos complexos de desenvolvimento de talento;
- dashboards executivos sofisticados;
- integração profunda com Google Drive;
- pacotes partilhados entre frontend e backend;
- deploy final self-hosted;
- aplicação mobile nativa;
- notificações push;
- moderação automática avançada de comentários.

## Critérios de sucesso do MVP

O MVP é aceitável se a empresa conseguir executar um ciclo real de avaliação de ponta a ponta:

1. configurar ciclo;
2. configurar critérios;
3. configurar regras básicas;
4. gerar atribuições elegíveis;
5. notificar colaboradores;
6. recolher avaliações;
7. permitir edição enquanto o ciclo estiver aberto;
8. fechar o ciclo;
9. calcular resultados ponderados;
10. aplicar regra de mínimo de respostas;
11. publicar resultados agregados;
12. mostrar comentários finais ao avaliado;
13. exportar dentro da política permitida;
14. auditar acesso administrativo.

## Prioridade funcional

Prioridade alta:

- autenticação;
- utilizadores;
- departamentos;
- hierarquia;
- ciclos;
- atribuições;
- avaliação;
- regras de elegibilidade;
- regras de aplicabilidade;
- scoring;
- auditoria;
- resultados.

Prioridade média:

- notificações;
- exportação;
- políticas de retenção;
- painéis administrativos.

Prioridade baixa no MVP:

- dashboards avançados;
- relatórios visuais sofisticados;
- integrações Google adicionais;
- automações complexas.

## Princípio de corte

Se uma funcionalidade não for necessária para executar um ciclo real de avaliação, ela não entra no MVP.

Se uma funcionalidade for visualmente interessante, mas não resolver o fluxo principal, ela deve esperar.

Se uma funcionalidade complicar regras de domínio antes de o fluxo básico estar validado, ela deve esperar ainda mais.
