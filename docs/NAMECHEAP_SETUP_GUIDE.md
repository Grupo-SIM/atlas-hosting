# Guia de Configuração Namecheap - Atlas Hosting

## Visão Geral

Este documento contém informações essenciais sobre como configurar e gerenciar a conta Namecheap para revenda de domínios e certificados SSL na plataforma Atlas Hosting.

---

## 1. Requisitos para Acesso à API

### 1.1 Acesso à API de Domínios

Para habilitar o acesso à API da Namecheap, você precisa atender a **pelo menos um** dos seguintes critérios:

- **Saldo na conta:** Manter um saldo de pelo menos **US$ 50** na conta
- **Domínios registrados:** Ter **20 ou mais domínios** registrados em sua conta
- **Histórico de compras:** Ter gasto **pelo menos US$ 50** nos últimos 2 anos

**Importante:**
- O acesso à API permanece ativo enquanto você continuar atendendo a pelo menos um dos critérios acima
- Não é um pagamento único - é um requisito contínuo
- O saldo de US$ 50 pode ser usado para comprar domínios normalmente

### 1.2 Acesso à API de Certificados SSL (Nível 1 de Revendedor)

Para começar a revender certificados SSL com a Namecheap, você precisa atender ao requisito mínimo para o **Nível 1 de Revendedor SSL**:

- **Gasto total:** Pelo menos **US$ 50** em produtos Namecheap

**Como se qualificar:**
- Se você já comprou produtos da Namecheap totalizando mais de US$ 50, sua conta está **automaticamente qualificada** para o Nível 1
- Se sua conta for nova ou se você ainda não tiver gasto US$ 50, será necessário depositar pelo menos **US$ 50** em seus fundos para se qualificar

**Nota:** O mesmo depósito de US$ 50 pode qualificar tanto para acesso à API de domínios quanto para o programa de revendedores SSL.

---

## 2. Sistema de Pagamento Automático

### 2.1 Como Funciona

A Namecheap oferece um sistema de cobrança automática que permite usar cartão de crédito quando o saldo da conta é insuficiente.

**Ordem de cobrança:**
1. **Primeiro:** Tenta usar o saldo da conta Namecheap
2. **Segundo:** Se saldo insuficiente, tenta cobrar do cartão padrão
3. **Terceiro:** Se cartão padrão falhar, tenta cartões alternativos (na ordem definida)

### 2.2 Configuração do Cartão de Crédito

**Passos para configurar:**

1. Faça login na sua conta Namecheap
2. Acesse: **Perfil → Cobrança → Cartões de Pagamento**
3. Clique em **"GERENCIAR"** para adicionar um cartão
4. Adicione os dados do seu cartão de crédito ou débito
5. Clique na seta ao lado de **"EDITAR"** e escolha **"Edit Defaults"**
6. Marque a opção **"Use for auto-renewal"** (Usar para renovação automática)
7. Clique em **"Save Changes"**

**Importante:**
- Apenas cartões de crédito/débito e fundos da conta podem ser usados para renovações automáticas
- PayPal não é compatível com pagamentos recorrentes (exceto para Apps)
- Certifique-se de que as informações do cartão estejam atualizadas

### 2.3 O que Funciona com Pagamento Automático

**Confirmado que funciona:**
- ✅ Renovações automáticas de domínios
- ✅ Renovações de hospedagem
- ✅ Renovações de certificados SSL
- ✅ Renovações de outros serviços

**Precisa testar:**
- ⚠️ Novos registros de domínios via API quando saldo é insuficiente
- ⚠️ Compras via API quando saldo é insuficiente

### 2.4 Limitações

**Importante:** A documentação oficial da Namecheap foca principalmente em **renovações automáticas**. Para novos registros via API quando o saldo é insuficiente, é recomendado:

1. **Testar primeiro:** Tentar registrar um domínio via API com saldo baixo para verificar se o cartão é usado automaticamente
2. **Manter saldo mínimo:** Manter pelo menos US$ 50-100 de saldo para garantir funcionamento
3. **Monitorar saldo:** Implementar sistema de monitoramento para alertar quando saldo estiver baixo

---

## 3. Estratégia Recomendada para o Projeto

### 3.1 Configuração Inicial

**Passo 1: Depósito Inicial**
- Depositar **US$ 50-100** inicialmente na conta Namecheap
- Isso ativa o acesso à API de domínios
- Isso qualifica para o programa de revendedores SSL (Nível 1)

**Passo 2: Cadastrar Cartão**
- Cadastrar cartão de crédito/débito na conta
- Definir como cartão padrão
- Ativar "Use for auto-renewal"

**Passo 3: Ativar Renovação Automática**
- Ativar renovação automática para todos os serviços
- Configurar para futuros serviços também

### 3.2 Fluxo de Trabalho

**Quando cliente compra domínio:**

```
1. Cliente escolhe domínio e paga via DOM API
2. Sistema verifica saldo Namecheap antes de criar fatura
3. Cliente paga → Dinheiro vai para conta DOM
4. Webhook confirma pagamento
5. Sistema tenta registrar domínio via API Namecheap:
   - Se saldo suficiente → Registra usando saldo
   - Se saldo insuficiente → Namecheap tenta usar cartão (se configurado)
6. Margem fica na conta DOM
```

### 3.3 Monitoramento

**Implementar:**
- Verificação de saldo antes de criar faturas
- Monitoramento periódico do saldo (a cada hora)
- Alertas quando saldo < US$ 60
- Dashboard mostrando saldo atual

**Benefícios:**
- Evita vender sem saldo suficiente
- Permite recarga proativa
- Mantém operação contínua

---

## 4. Requisitos de Saldo

### 4.1 Saldo Mínimo Recomendado

| Finalidade | Saldo Mínimo | Recomendado |
|------------|--------------|-------------|
| Acesso à API de Domínios | US$ 50 | US$ 50-100 |
| Programa Revendedores SSL | US$ 50 | US$ 50-100 |
| Operação Segura | - | US$ 100-200 |
| Margem de Segurança | - | US$ 50-100 adicional |

**Total Recomendado Inicial:** US$ 200-300

### 4.2 Quando Recarregar

**Sinais de alerta:**
- Saldo < US$ 60 (margem de segurança)
- Múltiplas vendas pendentes
- Alertas do sistema de monitoramento

**Estratégia:**
- Recarregar quando saldo < US$ 60
- Manter sempre acima de US$ 50 para garantir acesso à API
- Usar cartão como backup automático

---

## 5. Checklist de Configuração

### 5.1 Configuração Inicial

- [ ] Criar conta na Namecheap
- [ ] Depositar US$ 50-100 inicialmente
- [ ] Verificar acesso à API (deve estar ativo)
- [ ] Cadastrar cartão de crédito/débito
- [ ] Ativar "Use for auto-renewal" no cartão
- [ ] Definir cartão como padrão
- [ ] Ativar renovação automática para todos os serviços
- [ ] Configurar renovação automática para futuros serviços

### 5.2 Configuração do Sistema

- [ ] Configurar variáveis de ambiente:
  - `NAMECHEAP_API_USER`
  - `NAMECHEAP_API_KEY`
  - `PUBLIC_IP` (IP whitelisted na Namecheap)
- [ ] Testar conexão com API
- [ ] Implementar verificação de saldo antes de criar faturas
- [ ] Implementar monitoramento de saldo
- [ ] Configurar alertas de saldo baixo
- [ ] Testar registro de domínio via API

### 5.3 Testes

- [ ] Testar registro de domínio com saldo suficiente
- [ ] Testar registro de domínio com saldo insuficiente (verificar se cartão funciona)
- [ ] Testar renovação automática
- [ ] Verificar se margem está sendo calculada corretamente
- [ ] Testar webhook de pagamento

---

## 6. Informações Importantes

### 6.1 Links Úteis

- **Documentação API:** https://www.namecheap.com/support/api/intro/
- **Configurar Pagamento Automático:** https://www.namecheap.com/support/knowledgebase/article.aspx/10564/2207/can-i-set-up-automatic-billing-for-my-namecheap-services
- **Adicionar Cartão:** https://www.namecheap.com/support/knowledgebase/article.aspx/369/7/how-to-add-a-card-to-my-account-and-enable-autorenewal/
- **Adicionar Fundos:** https://www.namecheap.com/support/knowledgebase/article.aspx/232/7/how-can-i-add-funds-to-my-namecheap-account/

### 6.2 Suporte

- **Chat ao Vivo:** Disponível no site da Namecheap
- **Central de Ajuda:** https://www.namecheap.com/support/
- **Status do Sistema:** https://godaddy.com/system-status

### 6.3 Limitações Conhecidas

- PayPal não funciona para pagamentos recorrentes (exceto Apps)
- Saldo mínimo de US$ 50 deve ser mantido para acesso à API
- Novos registros via API com saldo insuficiente precisam ser testados
- Não há transferência automática de dinheiro da DOM para Namecheap

---

## 7. Próximos Passos

### 7.1 Implementações Necessárias

1. **Sistema de Verificação de Saldo**
   - Verificar saldo antes de criar faturas
   - Bloquear vendas se saldo insuficiente

2. **Sistema de Monitoramento**
   - Verificar saldo periodicamente (a cada hora)
   - Enviar alertas quando saldo < US$ 60

3. **Dashboard de Saldo**
   - Mostrar saldo atual da Namecheap
   - Mostrar margem acumulada na DOM
   - Histórico de transações

4. **Tratamento de Erros**
   - Tratar erros de saldo insuficiente
   - Retry automático (se aplicável)
   - Notificações de falhas

### 7.2 Melhorias Futuras

- Sistema de recarga automática (se Namecheap permitir)
- Integração com múltiplos registradores
- Relatórios de lucro/margem
- Previsão de quando saldo vai acabar

---

## 8. Resumo Executivo

### Requisitos Mínimos
- **Depósito inicial:** US$ 50 (para API + SSL)
- **Saldo recomendado:** US$ 100-200 (para operação segura)
- **Cartão de crédito:** Recomendado (backup automático)

### Vantagens
- ✅ Acesso à API com requisitos baixos
- ✅ Pagamento automático para renovações
- ✅ Possível pagamento automático para novos registros (testar)
- ✅ Margem fica na conta DOM

### Cuidados
- ⚠️ Manter saldo mínimo de US$ 50
- ⚠️ Monitorar saldo regularmente
- ⚠️ Testar se cartão funciona para novos registros
- ⚠️ Não há transferência automática DOM → Namecheap

---

**Última atualização:** 13 de Novembro de 2025  
**Versão:** 1.0  
**Autor:** Atlas Hosting Development Team

