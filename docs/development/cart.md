# Carrinho (domínios + VPS num pagamento só)

O cliente junta domínios e servidores em `/carrinho` (landing ou painel) e paga tudo num único PIX, boleto ou cartão.
Funciona deslogado: o login só é pedido em "Finalizar compra".

## Peças

- **Carrinho no navegador** (`lib/cart/store.ts`): `localStorage` (`atlas-cart-v1`), até `CART_MAX_ITEMS`. Os preços
  guardados são só estimativa de exibição. Item de VPS guarda a mesma query que a tela de configuração manda para
  `/checkout/personal-data`, lida por `vpsConfigFromSearchParams` (`lib/cart/vps-config.ts`), que é a mesma usada pelo
  checkout direto.
- **Botões**: `components/cart/AddToCartButtons.tsx` (busca da landing, `/domain` e sugestões no painel, as 4 telas de
  configuração de VPS) e `components/cart/CartButton.tsx` (Navbar da landing e Topbar do painel).
- **Fechar o pedido** (`app/cart-actions.ts`, `checkoutCart`): cria cada item com `createDomainInvoice` /
  `createVpsInvoice` (mesmo preço e mesma validação de sempre) e uma fatura **`type: "cart"`** com o total. As faturas dos
  itens (filhas) ganham `metadata.cartInvoiceId`; o pai guarda `metadata.cart.childInvoiceIds` e o resumo dos itens.
  Campos de link de pagamento do admin (`paymentLinkId`, `customLink*`) são descartados.
- **Entrega** (`settleCartInvoice` em `app/actions.ts`): roda depois do pagamento do pai, por qualquer caminho
  (`settleNonCardInvoice` para PIX/boleto/voucher; ramo `cart` em `completeCheckout` e `completeCheckoutWithSavedCard`).
  Cada filha segue o fluxo dela: domínio por `fulfillDomainInvoice`, VPS virando paga, com `createVpsSubscriptionIfNeeded`
  e `provisionPaidVps`. Helpers sem banco em `lib/cart/invoice.ts`.

## Regras que não podem quebrar

- **Filha só é paga pelo pai.** PIX, boleto, cartão, cartão salvo, voucher e cupom recusam fatura com
  `cartInvoiceId` (`CART_CHILD_PAYMENT_ERROR`), e o checkout da filha redireciona para o do pedido.
- **Meio de pagamento é a interseção.** PIX só se toda VPS do pedido aceitar PIX; boleto exige a chave global quando há
  domínio, mais a regra de cada VPS (`cartAllowsPix` / `cartAllowsBoleto`).
- **Domínio no pedido exige contato completo antes de cobrar**, igual à fatura de domínio avulsa; o saldo da Namecheap
  é checado com o custo somado (`namecheapCostUsd` do pai).
- **Entrega idempotente e com reserva**: `cartSettlementStartedAt` no pai impede entrega em paralelo (expira em 15 min);
  filha já paga é pulada numa nova tentativa. O PIX do pedido entra na conciliação (`/api/internal/domain-payments/reconcile`).
- **O pedido vira pago mesmo se um domínio falhar** (o dinheiro entrou e as VPS saíram). A filha fica `pending` com o erro
  em `domainRegistration`; o pai registra `cartFulfillment.failed` e a tela de sucesso avisa. Reprocesse pela rota
  admin de domínios (`reprocessDomainInvoice` usa o `pixCheckout` gravado na filha).
- **Voucher no pedido** é repartido entre as filhas na entrega (`splitCartDiscount`): comissão e relatórios usam o valor
  pago; `originalAmount` guarda o cheio, e é ele que vira o valor da renovação da VPS.
- **Sem contagem dupla**: faturas `cart` ficam fora das somas de `InvoiceStats`; relatórios por tipo (`domain`/`vps`)
  contam as filhas. Em "Minhas Faturas" aparecem só o pedido, sem as filhas.
- `invoices.type` é `text` sem CHECK no banco: o valor `cart` não precisou de migration.
