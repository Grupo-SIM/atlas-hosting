# Liberação individual do Criador de Sites

## Intenção

Permitir que `brenohslima@gmail.com` use e veja o Criador de Sites sem lhe conceder qualquer privilégio administrativo.

## Metas

- Manter administradores com o acesso atual.
- Autorizar exclusivamente a conta indicada além dos administradores.
- Exibir o item “Criador de Sites” à conta autorizada.

## Fora de escopo

- Alterar o acesso ao painel de Administração.
- Criar papéis ou uma permissão persistida no banco.
- Alterar as permissões dos demais usuários.

## Abordagens

1. Promover a conta a administradora: descartada, pois daria privilégios administrativos além do solicitado.
2. Guardar uma permissão no banco: adequada para uma lista dinâmica de usuários, mas requer schema, migration e gestão administrativa que não são necessários para uma única conta.
3. Centralizar uma exceção nominal no módulo de acesso do Criador de Sites e reutilizá-la na navegação: escolhida. É a menor alteração, preserva `isAdmin` para o Admin e torna a exceção explícita e testável.

## Design

O módulo `frontend/src/lib/site-builder/access.ts` exportará um predicado de acesso que aceita administradores ou o e-mail, comparado sem distinção entre maiúsculas e minúsculas. `getBuilderUser` usará o predicado. Os layouts receberão uma flag separada de acesso ao criador para que sidebar e menu mobile revelem apenas esse item, sem mudar a flag de admin.
