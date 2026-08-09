# Gerenciamento DNS Atlas

O Atlas usa o Plesk como autoridade DNS para domínios gerenciados. A Namecheap
é tratada como registrador: a API apenas consulta o domínio e configura os
nameservers; o editor não usa `setHosts`, pois esse método substitui a coleção
completa de registros.

## Configuração

- `ATLAS_DNS_NAMESERVERS`: pelo menos dois nameservers compartilhados, separados
  por vírgula. Exemplo: `ns1.meuservidor.inf.br,ns2.meuservidor.inf.br`.
- `DOMAIN_VERIFICATION_SECRET`: segredo usado para assinar o TXT de propriedade.
  Se ausente, o sistema usa `AUTH_SECRET`.
- Credenciais `PLESK_*` e `NAMECHEAP_*` já utilizadas pelo projeto.

Antes do deploy, aplique `drizzle/0002_add-domain-dns-management.sql`. O backfill
mantém domínios existentes no provedor atual para evitar qualquer mudança de
delegação sem consentimento.

Os nameservers configurados precisam responder autoritativamente pelas zonas
criadas no Plesk antes que o fluxo seja liberado em produção.
