# Integração Google Workspace

## Objetivos

O sistema deve usar Google Workspace para:

- identidade corporativa;
- login;
- identificação de colaboradores;
- sincronização opcional de diretório;
- notificações por email.

## Autenticação

Usar Google OAuth / OpenID Connect.

O backend deve validar a identidade e mapear a conta Google para um utilizador interno.

O sistema deve restringir login ao domínio Google Workspace da empresa.

## Sincronização de diretório

Se o acesso administrativo for aprovado, o backend pode usar Google Workspace Admin SDK Directory API para sincronizar:

- utilizadores;
- emails;
- estado ativo/inativo;
- unidades organizacionais;
- grupos;
- possíveis dados de chefia, se disponíveis.

A base de dados interna continua a ser a fonte de verdade da aplicação para dados específicos de avaliação.

## Dados locais complementares

O Google Workspace pode não conter todos os metadados necessários.

O sistema pode precisar manter localmente:

- departamento;
- cargo;
- nível hierárquico;
- gestor;
- regras de elegibilidade;
- categorias departamentais;
- overrides administrativos.

## Notificações

Canal inicial:

- email corporativo.

Canais futuros:

- Google Chat;
- Google Calendar;
- Google Drive para exportações.

Esses canais não fazem parte do MVP salvo aprovação explícita.

## Segurança

Usar os menores escopos possíveis.

Não usar domain-wide delegation sem necessidade real e aprovação administrativa.

Todos os jobs de sincronização devem ser auditados.

## Estratégia recomendada para o MVP

Começar com:

1. login Google;
2. validação de domínio;
3. cadastro interno complementar;
4. sincronização manual ou semi-automática de colaboradores;
5. integração avançada com Directory API numa fase posterior, se necessário.

Isto evita bloquear o MVP em permissões administrativas do Workspace.

## Mapeamento de utilizadores

O utilizador autenticado pelo Google deve ser associado a um registo interno `User`.

Campos importantes:

```text
google_sub
workspace_email
name
status
department_id
role_id
hierarchy_level_id
manager_id
````

O `google_sub` deve ser preferido como identificador estável da identidade Google.

O email corporativo pode mudar; o `google_sub` não deve mudar para a mesma conta Google.

## Restrições de domínio

O backend deve validar que o utilizador pertence ao domínio autorizado.

Exemplo conceitual:

```text
workspace_email ends with @empresa.com
```

A validação real deve usar dados confiáveis do token e configuração do domínio autorizado.

## Estados de utilizador

A aplicação deve bloquear acesso de utilizadores internos com estado:

```text
inactive
suspended
removed
```

Mesmo que a autenticação Google seja bem-sucedida, a autorização interna deve decidir se o acesso é permitido.

## Sincronização futura

Quando a integração Directory API for ativada, ela deve ser feita por job administrativo, não por consulta improvisada a cada login.

O job deve:

* buscar utilizadores ativos;
* atualizar emails e nomes;
* marcar utilizadores removidos ou suspensos;
* não apagar dados históricos de avaliação;
* gerar logs de sincronização;
* preservar overrides internos.

## Notificações por email

No MVP, lembretes e alertas podem ser enviados por email.

Eventos iniciais:

```text
cycle_opened
evaluation_pending
cycle_closing_soon
cycle_last_day
results_published
```

O envio deve ser registado em `NotificationLog`.

## Observação

A integração Google Workspace deve simplificar identidade e colaboração, não transformar o sistema numa dependência frágil de todos os serviços Google possíveis. Integração demais no início é só acoplamento vestido de estratégia.

