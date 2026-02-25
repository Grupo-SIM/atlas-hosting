# Requisitos do Módulo de Domínios

## Visão Geral

Este documento descreve os requisitos funcionais e técnicos para implementação de um módulo completo de gerenciamento de domínios em uma plataforma de hospedagem. O módulo deve permitir que usuários registrem, transfiram, gerenciem e renovem domínios de forma integrada com a plataforma de hospedagem.

## Funcionalidades Principais

### 1. Registro de Domínios

#### 1.1 Busca de Disponibilidade
- ✅ Interface de busca onde o usuário digita o nome do domínio desejado
- ✅ Verificação em tempo real da disponibilidade do domínio
- ✅ Suporte para múltiplas extensões TLD (.com, .com.br, .net, .org, etc.)
- ✅ Exibição de sugestões alternativas quando o domínio não está disponível
- ✅ Verificação de preços para diferentes TLDs
- ✅ Informação sobre preços de registro, renovação e transferência

#### 1.2 Processo de Registro
- ✅ Seleção do período de registro (1 a 10 anos, dependendo do TLD)
- ✅ Opção de adicionar proteção de privacidade WHOIS
- ✅ Coleta de informações de contato (Registrante, Admin, Técnico, Faturamento)
- ✅ Validação de dados de contato conforme requisitos do registrador
- ❌ Seleção de nameservers (padrão da plataforma ou personalizados)
- ✅ Geração de fatura e processamento de pagamento
- ✅ Confirmação de registro e ativação do domínio

#### 1.3 Configuração Inicial
- ❌ Configuração automática de DNS padrão após registro
- ❌ Opção de vincular domínio a um plano de hospedagem existente
- ❌ Criação automática de zona DNS se necessário

### 2. Transferência de Domínios

#### 2.1 Início de Transferência
- ✅ Interface para iniciar transferência de domínio existente
- ❌ Verificação de elegibilidade para transferência (domínio não expirado, não bloqueado, etc.)
- ❌ Solicitação e validação do código de autorização (EPP/Auth Code)
- ❌ Verificação de status de bloqueio no registrador atual
- ✅ Informação sobre custos e período de transferência

#### 2.2 Processo de Transferência
- ❌ Envio de solicitação de transferência ao registrador
- ❌ Notificações por email para aprovação da transferência
- ❌ Acompanhamento do status da transferência em tempo real
- ❌ Configuração automática de nameservers após transferência completa
- ❌ Integração com sistema de faturamento para cobrança

#### 2.3 Desbloqueio e Preparação
- ✅ Guia para desbloquear domínio no registrador atual
- ❌ Instruções para obter código de autorização
- ❌ Verificação de requisitos específicos por TLD

### 3. Gerenciamento de DNS

#### 3.1 Gerenciamento de Zona DNS
- ✅ Interface para visualizar todos os registros DNS do domínio
- ✅ Criação, edição e exclusão de registros DNS
- ✅ Suporte para tipos de registro: A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, PTR
- ✅ Configuração de TTL (Time To Live) para cada registro
- ✅ Validação de formatos de registros DNS
- ❌ Histórico de alterações DNS

#### 3.2 Nameservers
- ✅ Visualização de nameservers atuais do domínio
- ✅ Opção de usar nameservers padrão da plataforma
- ❌ Configuração de nameservers personalizados
- ✅ Verificação de propagação de nameservers
- ✅ Guia para configurar nameservers em outros registradores

#### 3.3 Templates e Presets
- ❌ Templates pré-configurados para cenários comuns (WordPress, email, etc.)
- ❌ Salvamento de configurações DNS como templates
- ❌ Aplicação de templates em múltiplos domínios

### 4. Renovação de Domínios

#### 4.1 Renovação Manual
- ❌ Interface para renovar domínios próximos ao vencimento
- ❌ Seleção de período de renovação (1 a 10 anos)
- ❌ Processamento de pagamento e confirmação
- ❌ Histórico de renovações

#### 4.2 Renovação Automática
- ❌ Configuração de renovação automática por domínio
- ❌ Seleção de método de pagamento para renovação automática
- ❌ Notificações antes da renovação automática
- ❌ Política de renovação automática (renovar sempre, apenas se houver saldo, etc.)

#### 4.3 Alertas de Expiração
- ❌ Sistema de notificações por email
- ❌ Alertas configuráveis (90, 60, 30, 15, 7, 3, 1 dias antes)
- ✅ Dashboard com lista de domínios próximos ao vencimento
- ✅ Alertas para domínios expirados

### 5. Gerenciamento de Contatos WHOIS

#### 5.1 Visualização de Contatos
- ❌ Exibição de informações de contato atuais (Registrante, Admin, Técnico, Faturamento)
- ✅ Indicação de quais contatos são privados (Domain Privacy)

#### 5.2 Edição de Contatos
- ❌ Formulário para editar informações de contato
- ❌ Validação de dados conforme requisitos do registrador
- ❌ Verificação de email para alterações de contato
- ❌ Histórico de alterações de contato

#### 5.3 Domain Privacy (WHOIS Protection)
- ❌ Ativação e desativação de proteção de privacidade
- ✅ Informação sobre custos adicionais
- ❌ Explicação sobre o que é protegido e o que não é

### 6. Bloqueio e Segurança

#### 6.1 Registrar Lock
- ✅ Visualização do status de bloqueio atual
- ❌ Ativação e desativação de bloqueio de transferência
- ❌ Explicação sobre quando usar bloqueio
- ❌ Avisos sobre necessidade de desbloqueio para transferências

#### 6.2 Segurança Adicional
- ❌ Autenticação de dois fatores para ações críticas
- ❌ Logs de todas as ações realizadas no domínio
- ❌ Notificações por email para alterações importantes
- ❌ Limitação de alterações frequentes (rate limiting)

### 7. Email Forwarding

#### 7.1 Configuração de Redirecionamento
- ❌ Criação de endereços de email que redirecionam para outros emails
- ❌ Suporte para múltiplos rederecionamentos por domínio
- ❌ Configuração de catch-all (receber todos os emails não configurados)
- ❌ Edição e exclusão de redirecionamentos

#### 7.2 Gerenciamento
- ❌ Lista de todos os redirecionamentos configurados
- ❌ Teste de redirecionamentos
- ❌ Histórico de alterações

### 8. Subdomínios

#### 8.1 Criação de Subdomínios
- ❌ Interface para criar subdomínios
- ❌ Configuração automática de registros DNS para subdomínios
- ❌ Vinculação de subdomínios a planos de hospedagem
- ❌ Lista de subdomínios existentes

#### 8.2 Gerenciamento
- ❌ Edição de configurações de subdomínios
- ❌ Exclusão de subdomínios
- ❌ Integração com sistema de hospedagem

### 9. Integração com Hospedagem

#### 9.1 Vinculação de Domínios
- ❌ Interface para vincular domínios a sites/hospedagem
- ❌ Múltiplos sites por domínio
- ❌ Configuração automática de DNS ao criar novo site
- ❌ Desvinculação de domínios

#### 9.2 SSL/HTTPS
- ✅ Geração automática de certificados SSL (Let's Encrypt)
- ❌ Renovação automática de certificados
- ❌ Status de certificados SSL
- ❌ Instalação de certificados personalizados

### 10. Dashboard e Relatórios

#### 10.1 Visão Geral
- ✅ Lista de todos os domínios do usuário
- ✅ Estatísticas (total, ativos, expirados, próximos a expirar)
- ✅ Status de cada domínio (ativo, expirado, em transferência, etc.)
- ❌ Filtros e busca de domínios

#### 10.2 Detalhes do Domínio
- ❌ Página dedicada para cada domínio
- ✅ Informações completas (datas, status, contatos, DNS, etc.)
- ✅ Ações rápidas (renovar, editar DNS, etc.)
- ❌ Histórico de eventos

#### 10.3 Relatórios
- ❌ Relatório de domínios por status
- ❌ Relatório de domínios próximos ao vencimento
- ❌ Relatório de custos de domínios
- ❌ Exportação de relatórios (CSV, PDF)

### 11. Faturamento e Pagamentos

#### 11.1 Preços
- ✅ Exibição clara de preços de registro, renovação e transferência
- ✅ Diferenciação de preços por TLD
- ❌ Informação sobre promoções e descontos
- ✅ Cálculo de totais antes da compra

#### 11.2 Processamento
- ✅ Integração com gateway de pagamento
- ✅ Suporte para múltiplos métodos de pagamento
- ✅ Faturas detalhadas para cada transação
- ✅ Histórico de faturas relacionadas a domínios
- ❌ Reembolsos quando aplicável

#### 11.3 Renovação Automática
- ❌ Configuração de método de pagamento padrão
- ❌ Tentativas automáticas de cobrança
- ❌ Notificações de falha no pagamento
- ❌ Políticas de renovação automática

### 12. Notificações e Comunicação

#### 12.1 Notificações por Email
- ❌ Confirmação de registro
- ❌ Confirmação de transferência
- ❌ Alertas de expiração
- ❌ Notificações de alterações importantes
- ❌ Lembretes de renovação
- ❌ Falhas em processos

#### 12.2 Notificações na Plataforma
- ✅ Notificações in-app para eventos importantes
- ✅ Centro de notificações
- ❌ Preferências de notificação por usuário

### 13. API e Integrações

#### 13.1 API REST
- ❌ Endpoints para todas as operações de domínio
- ❌ Autenticação via API keys
- ❌ Documentação completa da API
- ❌ Rate limiting e quotas

#### 13.2 Webhooks
- ✅ Eventos de webhook (domínio registrado, expirado, transferido, etc.)
- ❌ Configuração de URLs de webhook
- ❌ Retry de webhooks falhados
- ✅ Logs de webhooks

### 14. Suporte e Documentação

#### 14.1 Documentação
- ❌ Guias passo a passo para operações comuns
- ❌ FAQ sobre domínios
- ❌ Glossário de termos
- ❌ Tutoriais em vídeo (opcional)

#### 14.2 Suporte
- ✅ Sistema de tickets para suporte relacionado a domínios
- ❌ Chat ao vivo (opcional)
- ❌ Base de conhecimento

## Integrações Necessárias

### 1. Registradores de Domínio

#### 1.1 Namecheap
- ✅ Integração via API XML da Namecheap
- ✅ Funcionalidades: registro, transferência, renovação, gerenciamento de DNS, contatos WHOIS
- ✅ Suporte para múltiplas extensões TLD
- ✅ Gerenciamento de Domain Privacy (WhoisGuard)
- ✅ Configuração de nameservers
- ✅ Obtenção de informações de domínio

#### 1.2 GoDaddy
- ❌ Integração via GoDaddy API
- ❌ Funcionalidades similares ao Namecheap
- ❌ Suporte para domínios .com, .net, .org e outros TLDs
- ❌ Gerenciamento de DNS e contatos

#### 1.3 Registro.br (para domínios .br)
- ❌ Integração via API do Registro.br
- ❌ Registro e gerenciamento de domínios .com.br, .org.br, etc.
- ❌ Requisitos específicos para domínios brasileiros
- ❌ Validação de CPF/CNPJ

#### 1.4 Outros Registradores
- ❌ Cloudflare Registrar (via API)
- ❌ Google Domains (se disponível)
- ❌ AWS Route 53 (para registro e DNS)
- ❌ Outros registradores conforme demanda

### 2. Serviços de DNS

#### 2.1 DNS Próprio
- ❌ Infraestrutura própria de DNS
- ❌ Servidores de nomes dedicados
- ❌ Gerenciamento de zonas DNS
- ❌ API para gerenciamento de registros

#### 2.2 Serviços de DNS Externos
- ❌ Cloudflare (para DNS avançado e CDN)
- ❌ AWS Route 53 (para DNS e registro)
- ❌ Google Cloud DNS
- ❌ Azure DNS

### 3. Serviços de Certificação SSL

#### 3.1 Let's Encrypt
- ✅ Integração para certificados SSL gratuitos
- ❌ Renovação automática de certificados
- ✅ Suporte para múltiplos domínios e wildcards

#### 3.2 Certificados Comerciais
- ❌ Integração com provedores de certificados comerciais
- ❌ Sectigo, DigiCert, GlobalSign, etc.
- ❌ Venda de certificados como serviço adicional

### 4. Gateways de Pagamento

#### 4.1 Stripe
- ❌ Processamento de pagamentos
- ❌ Assinaturas para renovação automática
- ❌ Suporte para cartões e outros métodos

#### 4.2 PayPal
- ❌ Processamento via PayPal
- ❌ Integração com contas PayPal

#### 4.3 PagSeguro / Mercado Pago
- ❌ Para mercado brasileiro
- ❌ Suporte para boleto bancário
- ❌ PIX para pagamentos instantâneos

### 5. Serviços de Email

#### 5.1 Email Forwarding
- ❌ Serviço próprio de email forwarding
- ❌ Ou integração com provedores externos (SendGrid, Mailgun, etc.)

#### 5.2 Email Completo
- ✅ Integração com cPanel/Plesk para contas de email
- ❌ Ou serviços de email como Google Workspace, Microsoft 365

### 6. Serviços de Monitoramento

#### 6.1 Verificação de Propagação DNS
- ✅ Integração com APIs de verificação DNS (DNS Checker, etc.)
- ✅ Ou implementação própria de verificação

#### 6.2 Monitoramento de Status
- ✅ Verificação de status de domínios
- ❌ Alertas de problemas
- ❌ Uptime monitoring

### 7. Serviços de Hospedagem

#### 7.1 Integração com Painel de Controle
- ❌ cPanel (via API)
- ✅ Plesk (via API)
- ✅ Painel próprio de hospedagem

#### 7.2 Auto-configuração
- ❌ Criação automática de zonas DNS ao criar site
- ❌ Vinculação automática de domínios a planos de hospedagem
- ❌ Configuração automática de SSL

## Requisitos Técnicos

### 1. Banco de Dados

#### 1.1 Tabelas Necessárias
- ✅ domains: informações básicas dos domínios
- ❌ domain_contacts: contatos WHOIS dos domínios
- ❌ domain_dns_records: registros DNS
- ❌ domain_transfers: histórico de transferências
- ❌ domain_renewals: histórico de renovações
- ✅ domain_pricing: cache de preços de domínios
- ❌ domain_events: log de eventos e alterações

#### 1.2 Relacionamentos
- ✅ Domínios vinculados a organizações/usuários
- ❌ Domínios vinculados a planos de hospedagem
- ✅ Domínios vinculados a faturas
- ❌ Histórico de alterações

### 2. APIs Externas

#### 2.1 Integração com Registradores
- ✅ Clientes API para cada registrador
- ✅ Tratamento de erros e retry logic
- ✅ Cache de informações quando apropriado
- ❌ Rate limiting para evitar exceder limites da API

#### 2.2 Sincronização
- ❌ Sincronização periódica de status de domínios
- ❌ Atualização de informações de DNS
- ❌ Verificação de expirações
- ✅ Sincronização de preços

### 3. Processamento Assíncrono

#### 3.1 Filas de Trabalho
- ✅ Processamento de registros de domínio
- ❌ Processamento de transferências
- ✅ Atualização de DNS
- ❌ Envio de notificações
- ❌ Sincronização com registradores

#### 3.2 Jobs Agendados
- ❌ Verificação de domínios expirados
- ❌ Renovação automática
- ❌ Sincronização de status
- ❌ Atualização de preços
- ❌ Envio de alertas de expiração

### 4. Segurança

#### 4.1 Autenticação e Autorização
- ✅ Controle de acesso baseado em roles
- ✅ Permissões granulares por funcionalidade
- ❌ Autenticação de dois fatores para ações críticas
- ✅ Validação de propriedade de domínio

#### 4.2 Proteção de Dados
- ✅ Criptografia de informações sensíveis
- ❌ Proteção de códigos de autorização
- ❌ Logs de auditoria
- ❌ Conformidade com LGPD/GDPR

### 5. Performance

#### 5.1 Cache
- ✅ Cache de preços de domínios
- ✅ Cache de informações de domínio
- ✅ Cache de verificações de disponibilidade
- ✅ Invalidação inteligente de cache

#### 5.2 Otimização
- ✅ Queries otimizadas no banco de dados
- ✅ Indexação adequada
- ✅ Paginação de listas
- ✅ Lazy loading quando apropriado

## Fluxos de Trabalho Principais

### 1. Fluxo de Registro de Domínio

1. Usuário busca domínio
2. Sistema verifica disponibilidade via API do registrador
3. Sistema exibe preços e opções
4. Usuário seleciona período e opções (privacy, etc.)
5. Sistema coleta informações de contato
6. Sistema valida dados
7. Sistema gera fatura
8. Usuário realiza pagamento
9. Sistema processa registro via API do registrador
10. Sistema configura DNS padrão
11. Sistema envia confirmação
12. Domínio fica disponível para uso

### 2. Fluxo de Transferência de Domínio

1. Usuário inicia transferência
2. Sistema verifica elegibilidade
3. Usuário fornece código de autorização
4. Sistema valida código
5. Sistema verifica se domínio está desbloqueado
6. Sistema gera fatura
7. Usuário realiza pagamento
8. Sistema envia solicitação de transferência
9. Sistema envia email de aprovação ao registrante atual
10. Sistema monitora status da transferência
11. Após aprovação, transferência é completada
12. Sistema configura nameservers
13. Sistema envia confirmação

### 3. Fluxo de Renovação

1. Sistema detecta domínio próximo ao vencimento
2. Sistema envia alertas configurados
3. Se renovação automática ativada:
   - Sistema verifica método de pagamento
   - Sistema processa pagamento
   - Sistema renova domínio via API
   - Sistema envia confirmação
4. Se renovação manual:
   - Usuário acessa interface de renovação
   - Usuário seleciona período
   - Sistema gera fatura
   - Usuário realiza pagamento
   - Sistema renova domínio
   - Sistema envia confirmação

### 4. Fluxo de Gerenciamento de DNS

1. Usuário acessa gerenciamento de DNS
2. Sistema busca registros DNS atuais via API
3. Usuário visualiza registros existentes
4. Usuário cria/edita/exclui registros
5. Sistema valida formatos
6. Sistema atualiza registros via API
7. Sistema registra alteração no histórico
8. Sistema envia notificação (opcional)
9. Sistema exibe confirmação

## Considerações de Implementação

### 1. Faseamento

#### Fase 1 - MVP (Mínimo Produto Viável)
- ✅ Registro de domínios básico
- ✅ Integração com um registrador (Namecheap)
- ✅ Gerenciamento básico de DNS
- ✅ Listagem de domínios
- ❌ Renovação manual

#### Fase 2 - Funcionalidades Essenciais
- ❌ Transferência de domínios
- ❌ Renovação automática
- ❌ Alertas de expiração
- ❌ Gerenciamento de contatos WHOIS
- ✅ Domain Privacy

#### Fase 3 - Funcionalidades Avançadas
- ❌ Múltiplos registradores
- ❌ API completa
- ❌ Webhooks
- ❌ Templates DNS
- ❌ Relatórios avançados

#### Fase 4 - Otimizações
- ✅ Performance e cache
- ✅ Melhorias de UX
- ❌ Documentação completa
- ❌ Integrações adicionais

### 2. Prioridades

#### Alta Prioridade
- ✅ Registro de domínios
- ✅ Gerenciamento de DNS
- ❌ Renovação (manual e automática)
- ✅ Integração com Namecheap
- ❌ Sistema de notificações básico

#### Média Prioridade
- ❌ Transferência de domínios
- ❌ Gerenciamento de contatos
- ✅ Domain Privacy
- ❌ Integração com Registro.br
- ✅ Dashboard completo

#### Baixa Prioridade
- ❌ Múltiplos registradores
- ❌ API pública
- ❌ Webhooks
- ❌ Marketplace de domínios
- ❌ Funcionalidades avançadas de DNS

### 3. Riscos e Mitigações

#### Riscos Técnicos
- Falhas na API do registrador: implementar retry logic e fallbacks
- Timeout em operações: processamento assíncrono
- Sincronização de dados: jobs periódicos de sincronização
- Rate limiting: implementar filas e throttling

#### Riscos de Negócio
- Mudanças nas APIs dos registradores: abstração da camada de integração
- Alterações de preços: cache e atualização periódica
- Problemas de pagamento: sistema robusto de retry e notificações
- Conformidade regulatória: revisão legal e implementação de requisitos

## Métricas e Monitoramento

### 1. Métricas de Negócio
- Número de domínios registrados por período
- Taxa de conversão (busca para registro)
- Taxa de renovação
- Receita de domínios
- Tempo médio de transferência

### 2. Métricas Técnicas
- Tempo de resposta das APIs
- Taxa de sucesso de operações
- Erros e exceções
- Performance de queries
- Uso de recursos

### 3. Alertas
- Falhas críticas em APIs
- Domínios próximos ao vencimento sem renovação automática
- Falhas em processamento de pagamento
- Problemas de sincronização
- Erros em jobs agendados

## Conclusão

Este documento descreve um módulo completo de gerenciamento de domínios que atende às necessidades de uma plataforma de hospedagem moderna. A implementação deve ser feita de forma faseada, priorizando funcionalidades essenciais e garantindo integração robusta com registradores e outros serviços necessários.

A escolha dos registradores e serviços a integrar deve considerar o mercado-alvo, custos, confiabilidade das APIs e requisitos específicos de cada região ou tipo de domínio.

