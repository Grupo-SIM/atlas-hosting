# Auditoria de integrações: Cloudflare, Namecheap e Plesk

## Resultado

A autoridade e as mutações DNS podem ser centralizadas na Cloudflare. Registro
de domínios e serviços de hospedagem não são substitutos diretos e permanecem em
seus provedores atuais.

## Namecheap

| Responsabilidade | Estado | Avaliação |
| --- | --- | --- |
| Busca, disponibilidade e preço | Mantida | Função de registrador/catálogo. |
| Compra e renovação | Mantida | O requisito comercial mantém as compras na Namecheap. |
| Informações, expiração, lock e auto-renew | Mantida | Metadados do registrador exibidos pelo Atlas. |
| Troca de nameservers | Mantida | `domains.dns.setCustom` delega a zona para a Cloudflare. |
| Listagem e CRUD de host records | Removida do runtime | Cloudflare passa a armazenar e editar os registros. |
| TXT de desafio ACME | Migrada | Criado temporariamente na Cloudflare e removido após validação. |
| Sincronização DNS do WordPress | Migrada | A/AAAA/CNAME necessários são escritos diretamente na Cloudflare. |

Centralizar também compra e renovação exigiria mudar o registrador ou o modelo
comercial para Cloudflare Registrar, o que não faz parte desta migração.

## Plesk

| Responsabilidade | Estado | Avaliação |
| --- | --- | --- |
| Clientes e subscriptions de hospedagem | Mantida | Controla o servidor de origem. |
| WordPress Toolkit, plugins e administração | Mantida | Não é substituído pela API DNS da Cloudflare. |
| Bancos e arquivos da hospedagem | Mantida | Serviço de aplicação/origem. |
| Caixas de e-mail, IMAP e SMTP | Mantida | Cloudflare Email Routing não equivale a hospedagem de mailbox. |
| Certificado instalado no origin | Mantida | O certificado de borda Cloudflare não substitui necessariamente o certificado do Plesk. |
| Criação de zona e CRUD DNS | Removida | O plano Plesk não oferece DNS e a Cloudflare é a autoridade. |
| DNS automático em novas subscriptions | Desativado | As subscriptions são criadas com `-dns false`. |

O e-mail Plesk continua dependendo de registros publicados na Cloudflare: A de
`mail`, MX, SPF e possivelmente DKIM/DMARC. Esses valores não devem ser
inventados. A automação futura deve consultar a configuração real do servidor e
publicar os valores retornados.

## Cloudflare

A Cloudflare agora concentra:

- Criação idempotente de zonas e nameservers atribuídos por domínio.
- Status de ativação e acompanhamento da delegação.
- Scan assíncrono com revisão antes da importação.
- CRUD individual, proxy, TTL, comentários e tipos estruturados.
- Importação/exportação BIND e diagnóstico de registros.
- Registros web criados pelos instaladores e TXT temporário de ACME.

Limitações operacionais relevantes:

- O scan não garante descobrir a zona completa.
- Domínios externos ainda exigem alteração manual no registrador.
- DS/DNSSEC antigo precisa ser removido antes da troca.
- Zonas Free pendentes por 28 dias podem ser removidas pela Cloudflare.
