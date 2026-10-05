# Regras de produto Atlas

## Domínios

- Exclusão é operação do dono real da organização, sem impersonação. Transferência de conta em andamento bloqueia a operação.
- Domínio comprado só pode ser removido sem vigência paga válida, recorrência ativa e renovação pendente. Renovação manual não dispensa proteção da vigência.
- DNS Cloudflare é apagado antes do vínculo Atlas; erro preserva vínculo para nova tentativa. Zona ausente equivale a sucesso. Histórico financeiro e de transferências permanece preservado.
- Remoção não apaga hospedagem e não cancela registro no fornecedor. Para domínio externo gerenciado, modal avisa para trocar nameservers no registrador original antes de excluir; confirmação não exige comprovação.
- Recuperação externa exige adicionar novamente, verificar posse e recriar DNS. Não há restauração automática de registros. Recuperação de comprado expirado depende do registrador; disponibilidade, preço e prazo não são garantidos.
- DNS externo permite consulta pública parcial. Migração exige revisar registros antes da delegação; scan não garante zona completa. DS/DNSSEC antigo deve ser resolvido antes de trocar nameservers.

## Assinaturas, usuários e links VPS

- Filtros de usuários avaliam todas as assinaturas vigentes. Usuário com assinaturas automáticas e manuais aparece nos dois filtros. Cartão sem recorrência ativa é manual.
- Página Assinaturas Manuais foi removida; URL redireciona para Usuários. Tabela e registros antigos são preservados; pagamentos externos não viram cobranças.
- Link VPS exige plano e preserva preço e período personalizados. Criação não cobra; checkout cria/reutiliza fatura; pagamento confirmado cria assinatura e inicia provisionamento. Assinaturas aparecem em Planos VPS e Usuários.
- Links diretos persistem senha forte e configuração mínima de provisionamento; Windows usa imagem Windows. Faturas antigas sem esses dados são completadas antes da chamada ao fornecedor, preservando credenciais nos retries.
- Eventos de pagamento repetidos não duplicam assinatura. Cartão com recorrência ativa renova automaticamente; PIX/boleto e cartão sem recorrência ativa exigem pagamento manual.
- Cancelar link invalida fatura ainda não paga e sem pagamento iniciado. Operação já iniciada exige conciliação antes de cancelar.

## Vouchers

- Validação é exclusivamente no servidor: prazo, titularidade da fatura, vínculo do voucher, uso disponível e ausência de pagamento iniciado.
- Um voucher por fatura; desconto não cumulativo, calculado em centavos, sem valor negativo. Associação, valor original e desconto são persistidos e sobrevivem à recarga do checkout.
- Aplicar reserva uso; remoção restaura valor original e libera reserva. Expiração de fatura sem pagamento iniciado libera reserva; cobrança iniciada permanece reservada até conciliação.
- Reservas concorrentes respeitam limite de usos. Pagamento confirmado consome uma única vez, mesmo com notificação repetida.
- Desconto integral usa confirmação interna sem cobrança zero no gateway. Voucher vale para fatura aplicada; renovações mantêm preço contratado sem repetir desconto.

## Fornecedores e avisos

- Consulta de fornecedores exige administrador real. Namecheap informa disponível, total, moeda e fundos de renovação automática; Contabo informa configuração e inventário VPS, sem saldo financeiro estimado.
- Carregamento, erro e vazio são estados distintos. Consulta indisponível nunca equivale a saldo zero. Credenciais permanecem no servidor.
- `EMERGENCY_ALERT_EMAILS` aceita lista separada por vírgulas, remove espaços/duplicatas e usa `DOMAIN_EMAIL` como fallback. Envio individual preserva privacidade; falha não impede demais destinatários.
- Avisos apenas nas operações existentes: saldo baixo (limite USD 40), compra bloqueada e falha operacional. Sem monitoramento periódico novo.

Procedimentos do cliente e limites reais ficam em `knowledge-base-n8n.txt`; configuração de avisos em [operational-alerts.md](operational-alerts.md). Atualização N8N é entrega de arquivo local, sem publicação automática.
