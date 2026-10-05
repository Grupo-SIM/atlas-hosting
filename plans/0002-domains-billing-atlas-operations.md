# Domínios, cobranças e operação Atlas

Plano aprovado pelo usuário. Execução exclusivamente local; sem banco externo, e-mails reais ou publicação N8N.

## Progresso

- [x] Domínios: exclusão segura, confirmação e recuperação. Backend valida dono, vigência/recorrência Namecheap, cobranças e transferências; DNS removido antes do vínculo; histórico preservado por migration 0007 (não executada). Modal esclarece nameservers e limites de recuperação. 18 testes Bun passaram com dependências simuladas.
- [x] Usuários e VPS: filtros consideram todas assinaturas vigentes e token real; tela manual removida com redirecionamento. Links usam preço/período do servidor e criação transacional; cancelamento expira fatura e bloqueia cobrança iniciada. Migration 0009 entrega chave idempotente por fatura inicial, sem executar. 5 testes Bun passaram; integração de pagamento compartilhada com etapa de vouchers.
- [x] Vouchers: autorização real e titularidade, reserva serializada por bloqueio de linha, centavos, valor/associação persistidos e restauração ao remover/expirar. Migration 0008 (não executada) consome uma única vez em qualquer confirmação de pagamento. Checkout recarrega valor salvo e confirma desconto integral internamente, sem gateway; criação de cobrança usa reserva atômica para impedir alteração/duplicação. Testes Bun com banco/pagamentos simulados cobrem confirmação integral, repetição, preço contratado, concorrência de cartão e resultado incerto. Timeout/PENDING preserva bloqueio para conciliação; recusa final permite nova tentativa. Trocar titular da fatura libera voucher anterior.
- [x] Fornecedores: consulta administrativa e alertas individuais.
- [ ] Atlas IA e documentação operacional/produto.
- [ ] Validação local com dependências simuladas, build e commits atômicos.

## Próximos passos

Implementar etapas aprovadas; registrar conclusão e evidência junto de cada commit. Entregar migrations sem executá-las.

Evidência fornecedores: 14 testes Bun passaram com rede isolada (`unshare -Urn`) e sem carregamento de `.env`.
