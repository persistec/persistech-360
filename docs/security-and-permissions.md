# Segurança e permissões

## Princípios de segurança

- Autenticar todos os utilizadores.
- Autorizar todas as operações sensíveis no backend.
- Não confiar em validações do frontend.
- Registar acesso administrativo em logs de auditoria.
- Aplicar princípio do menor privilégio.
- Manter segredos fora do frontend.
- Ocultar identidade dos avaliadores para os avaliados.

## Papéis recomendados

```text
employee
manager
hr_admin
system_admin
super_admin
````

## Permissões de colaborador

Pode:

* ver o próprio perfil;
* ver avaliações pendentes;
* submeter avaliações elegíveis;
* editar avaliações submetidas enquanto o ciclo estiver aberto;
* ver resultados próprios publicados;
* ver comentários finais recebidos.

Não pode:

* avaliar a si próprio;
* avaliar superiores;
* ver identidade dos avaliadores;
* ver avaliações brutas de outros colaboradores;
* exportar dados de avaliação.

## Permissões de gestor

Pode:

* avaliar subordinados elegíveis;
* ver resumos da equipa, se a política permitir.

Não recebe automaticamente permissão para:

* ver identidade de avaliadores;
* aceder a avaliações brutas;
* quebrar anonimato funcional.

## Permissões de RH/admin funcional

Pode:

* configurar ciclos;
* configurar critérios;
* configurar regras de elegibilidade;
* configurar pesos;
* rever resultados;
* publicar resultados;
* exportar dentro da janela permitida;
* aceder a registos identificados.

## Permissões de administrador técnico

Pode:

* gerir infraestrutura;
* apoiar operações técnicas;
* configurar aspetos técnicos da aplicação.

Não deve automaticamente:

* aceder a dados sensíveis de RH;
* exportar avaliações;
* atuar como administrador funcional de RH.

## Auditoria obrigatória

Auditar no mínimo:

* administrador visualizando avaliações identificadas;
* exportação de dados;
* criação de ciclo;
* abertura de ciclo;
* fecho de ciclo;
* publicação de resultados;
* alterações em política de retenção;
* alterações manuais em atribuições;
* edições administrativas.

## Regra do frontend

Validações no frontend são apenas auxiliares de UX.

O backend deve impor todas as permissões reais.

## Segredos

O frontend só pode receber variáveis públicas, como:

```text
NEXT_PUBLIC_API_BASE_URL
```

Segredos como credenciais Google, tokens, chaves privadas e URLs sensíveis devem existir apenas no backend ou no ambiente de CI/CD.

## Sessões e autenticação

A identidade autenticada deve ser validada no backend.

O backend deve mapear a identidade Google para um utilizador interno ativo.

Utilizadores inativos, suspensos ou removidos não devem conseguir aceder à aplicação, mesmo que ainda consigam autenticar-se no Google.

## Autorização

A autorização deve considerar:

* papel do utilizador;
* estado do ciclo;
* relação entre avaliador e avaliado;
* nível hierárquico;
* departamento;
* permissões administrativas explícitas.

Nenhuma operação sensível deve depender apenas de dados enviados pelo cliente.

## Logs administrativos

Qualquer acesso administrativo a dados identificados deve gerar log.

O log deve conter, no mínimo:

```text
actor_id
action
resource_type
resource_id
metadata
ip_address
created_at
```

## Exportações

Exportações devem ser permitidas apenas dentro da janela configurada na política de retenção/exportação.

Cada exportação deve ser auditada.

Exports expirados devem ser bloqueados ou removidos conforme política futura.
