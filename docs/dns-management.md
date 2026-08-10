# Gerenciamento DNS Atlas

O Atlas usa zonas **full** da Cloudflare como autoridade para todo domínio com
`dns_mode = 'cloudflare'`. A Namecheap continua sendo o registrador dos domínios
comprados pela plataforma e só recebe os nameservers atribuídos a cada zona.
O Plesk não é mais usado como servidor DNS.

## Configuração

- `CLOUDFLARE_API_TOKEN`: token server-only com `Zone Read`, `Zone Edit`,
  `DNS Read` e `DNS Edit`, limitado à conta operacional do Atlas.
- `DOMAIN_VERIFICATION_SECRET`: segredo que assina o TXT de propriedade. Se
  ausente, o sistema usa `AUTH_SECRET`.
- `NAMECHEAP_*`: continuam necessários para compra, renovação, consulta e
  delegação dos domínios registrados pelo Atlas.

O IP de saída dos jobs de compra e reconciliação deve constar na allowlist da
API Namecheap; caso contrário, a API responde com o erro `1011150`.

O token é usado sem `account.id`: o escopo da conta é determinado pela política
do próprio token. Nunca envie esse token a Client Components ou ao navegador.

## Estados e fluxos

- `external`: o Atlas mostra somente registros públicos detectáveis.
- `cloudflare`: a zona é editável pelo Atlas, mesmo enquanto aguarda delegação.
- `legacy_plesk`: domínio preexistente que precisa iniciar a migração assistida.

Domínios externos passam por TXT de propriedade, criação da zona, scan, revisão
dos registros e troca manual dos nameservers. Em domínios Namecheap existentes,
a troca é executada pelo Atlas somente depois da revisão. Compras novas criam a
zona e delegam automaticamente logo após o registro.

O scan da Cloudflare é assíncrono e procura apenas registros comuns. O usuário
deve revisar o resultado e pode complementar a zona manualmente ou importar um
arquivo BIND de até 256 KiB. A edição usa operações individuais; não há
substituição destrutiva da coleção completa.

## Migração e rollout

1. Aplique `drizzle/0002_add-domain-dns-management.sql` ou execute o `db:push`
   controlado do ambiente.
2. Rode `bun scripts/reconcile-domain-dns.ts` para visualizar a classificação.
3. Depois de revisar o resumo, rode o mesmo comando com `--apply`.
4. Migre os domínios `legacy_plesk` individualmente pela tela de detalhes.

O script é dry-run por padrão. Ele classifica domínios encontrados na conta
Namecheap como `legacy_plesk`; os demais permanecem `external`. Ele não cria
zonas nem troca nameservers.

Para provisionar automaticamente um domínio Namecheap já marcado no banco com
`registrar_provider = 'namecheap'` e `dns_mode = 'cloudflare'`, use o script
separado abaixo. Ele também é dry-run por padrão:

```bash
bun scripts/provision-namecheap-cloudflare-dns.ts
bun scripts/provision-namecheap-cloudflare-dns.ts --apply
bun scripts/provision-namecheap-cloudflare-dns.ts --apply --domain example.com
bun scripts/provision-namecheap-cloudflare-dns.ts --apply --activation-wait-seconds 600
```

O tempo padrão reservado ao scan assíncrono da Cloudflare é 60 segundos. Ele
pode ser alterado com `--scan-wait-seconds N`. O script cria ou reutiliza a
zona, aceita os registros encontrados sem proxy e só envia os nameservers à
Namecheap quando a zona contém pelo menos um registro. Domínios com DNSSEC/DS
publicado, fora da conta configurada ou sem permissão de alteração são
registrados como erro e não têm os nameservers modificados.

Depois da delegação, o script consulta as zonas pendentes em paralelo a cada 15
segundos e aguarda até 10 minutos pela confirmação da Cloudflare. Esse limite
pode ser alterado com `--activation-wait-seconds N`. Após 60 segundos, o script
solicita uma única checagem de ativação para cada zona ainda pendente. Uma
execução só termina com sucesso quando todas as zonas chegam a
`cloudflare_zone_status = 'active'` e `connection_status = 'connected'`. Se o
prazo expirar, o processo retorna código 1 e preserva a zona como
`awaiting_activation` para permitir uma nova tentativa.

Antes da delegação, o Atlas procura registros DS publicados. DNSSEC antigo deve
ser removido no registrador para evitar `SERVFAIL`. A primeira versão não publica
DS automaticamente na Namecheap.

Referências:

- https://developers.cloudflare.com/api/resources/zones/methods/create/
- https://developers.cloudflare.com/api/resources/dns/subresources/records/
- https://developers.cloudflare.com/dns/zone-setups/reference/domain-status/
- https://developers.cloudflare.com/dns/dnssec/
