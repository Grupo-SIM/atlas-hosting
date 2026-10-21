# Regras de produto Atlas

## Domínios

- Exclusão é operação do dono real da organização, sem impersonação. Transferência de conta em andamento bloqueia a operação.
- Domínio comprado só pode ser removido sem vigência paga válida, recorrência ativa e renovação pendente. Renovação manual não dispensa proteção da vigência.
- DNS Cloudflare é apagado antes do vínculo Atlas; erro preserva vínculo para nova tentativa. Zona ausente equivale a sucesso. Histórico financeiro e de transferências permanece preservado.
- Remoção não apaga hospedagem e não cancela registro no fornecedor. Para domínio externo gerenciado, modal avisa para trocar nameservers no registrador original antes de excluir; confirmação não exige comprovação.
- Recuperação externa exige adicionar novamente, verificar posse e recriar DNS. Não há restauração automática de registros. Recuperação de comprado expirado depende do registrador; disponibilidade, preço e prazo não são garantidos.
- DNS externo permite consulta pública parcial. Migração exige revisar registros antes da delegação; scan não garante zona completa. DS/DNSSEC antigo deve ser resolvido antes de trocar nameservers.

## Assinaturas, usuários e links VPS

- Tabela, PDF e filtros de usuários mostram os métodos de cobrança de todas as assinaturas vigentes: cartão de crédito, PIX, boleto e voucher. Usuário com vários métodos aparece em cada filtro correspondente. Assinaturas expiradas ou canceladas não contam; sem assinatura vigente aparece como Sem assinatura.
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

## Renovação VPS e proteção de cobrança Contabo

- Compra no dia X: cobrança da próxima renovação no dia X − 2 do ciclo contratado. Cartão com token tem uma tentativa nessa data e outra em X − 1; reinícios não repetem tentativa no mesmo dia civil de Recife. Timeout/resposta pendente preserva reserva de pagamento e exige conciliação, sem repetir cobrança incerta; ausência de confirmação mantém prazo de cancelamento.
- Sem pagamento confirmado após segunda tentativa (ou até X − 1 para métodos manuais), agendar cancelamento da instância vinculada na Contabo para o aniversário X. Ausência de vínculo ou erro do fornecedor gera falha operacional; nunca reportar cancelamento confirmado nesses casos.
- Aviso de renovação pendente aparece na plataforma a partir de 15 dias antes da cobrança. Cliente recebe emails aos 15, 8 e 1 dias antes e no dia da renovação com plano, valor, período, data e checkout de renovação, somente com pagamento ausente ou falho. Fatura paga, cobrança em processamento ou tentativa de cartão incerta não gera lembrete; cobrança em andamento pode ser reavaliada no mesmo dia após falha confirmada. Envios manuais pelo painel e endpoint interno permitem reenvio no mesmo dia/ciclo. Checkpoints persistidos evitam reenvio automático em reinícios; pagamento antecipado encerra avisos daquele ciclo.
- Checkout é reutilizado dentro do ciclo. Pagamento confirmado mantém aniversário original e avança período contratado, independentemente de Pix/cartão/boleto/voucher. Reconciliação no servidor também cobre renovações Pix VPS com checkout fechado, inclusive após agendamento do cancelamento. Cobranças de cartão pendentes com ID retornado pelo gateway continuam sendo conciliadas após esse agendamento.
- Pagamento confirmado após agendamento do cancelamento registra necessidade de retirada manual e envia email emergencial para `EMERGENCY_ALERT_EMAILS` (fallback `DOMAIN_EMAIL`), com nome e ID da instância na Contabo. API pública não oferece retirada automática de cancelamento de VPS. Falha SMTP mantém alerta pendente para nova tentativa; pagamento permanece reconhecido.
- Cancelamento executado pela Contabo não é reversível pelo pagamento: alerta exige conferir existência da instância antes de prometer continuidade do serviço.

## Comunicação da marca

- Telas, emails e avisos voltados ao cliente usam a marca Atlas, sem identificar fornecedores de infraestrutura ou registro. Telas administrativas, alertas internos e identificadores técnicos das integrações podem referenciar fornecedores.
- Lembrete de renovação informa prazo até o dia seguinte à renovação, cancelamento da VPS e consequente apagamento dos dados em caso de inadimplência, além das tentativas automáticas com cartão cadastrado na renovação e no dia seguinte.

## Pagamentos Pix

- `dueDate` no Atlas corresponde à coluna `due_date`: vencimento da fatura, distinto da expiração da cobrança no gateway. Novas faturas de domínio vencem em 24 horas; a integração Atlas na SimIntPay também solicita Pix com validade de 24 horas a partir da emissão da cobrança.
- Detecção no checkout permanece ativa durante as 24 horas do Pix, sem corte aos 15 minutos. Servidor concilia com checkout fechado e consulta o mesmo host configurado para criar a cobrança.
- Vencimento local não descarta dinheiro recebido: confirmação do gateway continua elegível para conciliação mesmo em fatura expirada. Entrega exige confirmação no servidor e reserva em banco contra processamento paralelo.
