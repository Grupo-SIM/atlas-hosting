# Domínios, cobranças e operação Atlas

Plano aprovado pelo usuário. Execução exclusivamente local; sem banco externo, e-mails reais ou publicação N8N.

## Progresso

- [x] Domínios: exclusão segura, confirmação e recuperação. Backend valida dono, vigência/recorrência Namecheap, cobranças e transferências; DNS removido antes do vínculo; histórico preservado por migration 0007 (não executada). Modal esclarece nameservers e limites de recuperação. 18 testes Bun passaram com dependências simuladas.
- [x] Usuários e VPS: filtros consideram todas assinaturas vigentes e token real; tela manual removida com redirecionamento. Links usam preço/período do servidor e criação transacional; cancelamento expira fatura e bloqueia cobrança iniciada. Migration 0009 entrega chave idempotente por fatura inicial, sem executar. 5 testes Bun passaram; integração de pagamento compartilhada com etapa de vouchers.
- [x] Vouchers: autorização real e titularidade, reserva serializada por bloqueio de linha, centavos, valor/associação persistidos e restauração ao remover/expirar. Migration 0008 (não executada) consome uma única vez em qualquer confirmação de pagamento. Checkout recarrega valor salvo e confirma desconto integral internamente, sem gateway; criação de cobrança usa reserva atômica para impedir alteração/duplicação. Testes Bun com banco/pagamentos simulados cobrem confirmação integral, repetição, preço contratado, concorrência de cartão e resultado incerto. Timeout/PENDING preserva bloqueio para conciliação; recusa final permite nova tentativa. Trocar titular da fatura libera voucher anterior.
- [x] Fornecedores: consulta administrativa e alertas individuais.
- [x] Atlas IA e documentação operacional/produto. Base local cobre DNS/migração/DNSSEC/exclusão/recuperação, links, faturas, vouchers e provisionamento. Regras em docs/business-rules.md; avisos e migrations documentados.
- [x] Validação local com dependências simuladas, build e commits atômicos. 144 testes Bun passaram, 3 condicionais de banco pulados, nenhuma falha. Build Next completo passou incluindo TypeScript e geração de páginas, com rede isolada e fonte Google simulada localmente.

## Próximos passos

Execução local concluída. Migrations 0007/0008/0009 e base N8N entregues em arquivo, sem execução/publicação. Revisão operacional de aplicação das migrations fica documentada em docs/billing-domain-migrations.md.

Evidência fornecedores: 14 testes Bun passaram com rede isolada (`unshare -Urn`) e sem carregamento de `.env`.


## Evidência final

- `unshare -Urn bun --no-env-file test src`: 144 pass, 3 skip, 0 fail; 430 assertions, 38 arquivos. Banco, gateway, fornecedores e e-mails simulados. Condicionais de banco exigem URL local explícita e não foram habilitados.
- `unshare -Urn env __NEXT_PROCESSED_ENV=1 NEXT_TELEMETRY_DISABLED=1 NEXT_FONT_GOOGLE_MOCKED_RESPONSES="$PWD/tmp/atlas-font-mock.cjs" bun run build`: exit 0. Fonte simulada apenas para validar build offline; mock não faz parte do código entregue.
- Cinco commits locais atômicos, autor e committer Git configurados na máquina, trailer Codex. Commits normais, sem bypass; nenhum hook ativo configurado neste repositório.
- Nenhuma migration executada, nenhum e-mail real, push, publicação ou alteração N8N.
