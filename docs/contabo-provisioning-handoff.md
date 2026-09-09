# Handoff — provisionamento Contabo

## Objetivo do usuário

Automatizar provisionamento pós-pagamento de VPS/VDS/Storage VPS pela API da Contabo.

- Fluxo idempotente por fatura paga.
- Salvar `instanceId` Contabo.
- Em falha Contabo, enviar e-mail para `process.env.EMAIL`.
- Para Object Storage, Full Monitoring e expansões VDS: **não provisionar automaticamente**; somente avisar por e-mail quando comprados.
- Remover do configurador/compra: Object Storage, Monitoring, expansões VDS, cPanel, todos os Aplicativos, todos os Blockchain e Plesk + Windows.
- Manter Webmin e Webmin + LAMP: pertencem à categoria Painéis, não Aplicativos.

## Estado do repositório

Commit base antes de trabalho atual: `f46d05b feat(contabo): map Atlas VPS options to provisioning payload`.

Mudanças não commitadas nesta conversa:

- `src/lib/contabo/image-id.ts`: mapeamento inicial Atlas → `imageId`.
- `src/lib/contabo/image-id.test.ts`: teste inicial.
- `src/lib/contabo/index.ts`: export de `image-id`.
- `src/lib/contabo/provisioning.ts`: interface recebeu campos de versão; removidos bloqueios de Object Storage/Monitoring para permitir VPS base no fluxo futuro.

Confira `git status` antes de editar. Não descarte mudanças.

## Implementado antes desta conversa

`src/lib/contabo/provisioning.ts` constrói payload de `POST /v1/compute/instances`:

| Atlas | Contabo |
|---|---|
| Cloud VPS 4/6/8/12/16/18 SSD | V153/V154/V155/V156/V157/V158 |
| Cloud VPS 4/6/8/12/16/18 NVMe | V159/V160/V161/V162/V163/V164 |
| VDS S/M/L/XL/XXL | V8/V9/V10/V11/V16 |
| Storage VPS 10/20/30/40/50 | V93/V96/V99/V102/V105 |
| `eu`, `us-east`, `sg`, `jp`, `in`, `uk`, `au-sydney` | `EU`, `US-east`, `SIN`, `JPN`, `IND`, `UK`, `AUS` |
| backup | `addOns.backup: {}` |
| rede privada | `addOns.privateNetworking: {}` |
| segundo IPv4 | `addOns.additionalIps: {}` |
| Plesk Linux | PleskAdmin/PleskPro/PleskHost |

`src/lib/contabo/createVps.ts` faz a chamada REST, mas ainda não é chamado após pagamento.

## Image IDs fornecidos pelo usuário

| Imagem | ID |
|---|---|
| Ubuntu 24.04 LTS | `ubuntu.332` |
| Ubuntu 22.04 LTS | `ubuntu.323` |
| Windows Server 2025 Datacenter | `windows-server.335` |
| Windows Server 2022 Datacenter | `windows-server.308` |
| Windows Server 2019 Datacenter (inferido; lista repetiu 2025) | `windows-server.273` |
| Windows Server 2016 Datacenter (inferido; lista repetiu 2025) | `windows-server.185` |
| AlmaLinux 9 | `rhel-variants.325` |
| Rocky Linux 9 | `rhel-variants.326` |
| Plesk Obsidian Web Admin | `plesk-linux.323.1047` |
| Plesk Obsidian Web Host | `plesk-linux.323.1044` |
| Plesk Obsidian Web Pro | `plesk-linux.323.1045` |
| Debian 13 | `debian.340` |
| Debian 12 | `debian.329` |
| Webmin Ubuntu 22.04 | `webmin.323.639` |
| Webmin AlmaLinux 9 | `webmin.325.639` |
| Webmin Rocky Linux 9 | `wemin.326.639` |
| Webmin + LAMP Ubuntu 22.04 | `webmin.323.1168` |
| Webmin + LAMP AlmaLinux 9 | `webmin.325.1168` |
| Webmin + LAMP Rocky Linux 9 | `wemin.326.1168` |

## Dados adicionais fornecidos pelo usuário

- Full Monitoring no checkout Contabo: `addons=211`.
- Object Storage 250 GB no checkout Contabo: `object-storage=object-storage-250gb`.
- Não usar esses valores no payload REST de instância sem confirmar formato. Apenas alertar administrador quando seleção legada existir.

## Implementação restante

### 1. Idempotência e persistência

Criar tabela Drizzle, por exemplo `vps_provisioning_jobs`:

- `invoiceId` único (FK para invoice).
- `status`: pending/provisioning/created/failed.
- `instanceId` texto/número nullable.
- erro, timestamps.

Exportar em `src/lib/db/schema/index.ts`. Não executar `db:push`: o usuário deve aplicar migração local/produção conscientemente.

Usar `insert(...).onConflictDoNothing().returning()` como reserva atômica. Só quem ganhou reserva chama Contabo.

### 2. Serviço pós-pagamento

Criar `src/lib/contabo/provision-paid-vps.ts`:

1. Ignorar invoice não VPS ou `metadata.isRenewal`.
2. Criar/reservar job idempotente.
3. Detectar extras manuais no `metadata.config`: `objectStorage !== none`, `monitoring === full`, `storageUpgrades` com quantidade positiva. Enviar alerta para `process.env.EMAIL`; continuar VPS base.
4. Resolver `imageId` com `resolveContaboImageId`.
5. Criar Secret Contabo de senha (`POST /secrets`) e passar `secretId` como `rootPassword`. Função ainda não existe; `Contabo.Body.CreateSecret` e tipos já existem em `src/lib/contabo/types.ts`.
6. `createVps(buildContaboInstanceRequest(...))`.
7. Salvar `instanceId` no job. Quando IP estiver disponível via GET da instância, criar `pgVpsServers` e salvar `externalId`; vincular `vpsSubscription.vpsNodeId`.
8. Em toda falha: job `failed`, `pgLog`, e `sendNotificationEmail(process.env.EMAIL, ...)`.

Não chamar Contabo em testes.

### 3. Ligar a pagamentos

Pontos existentes em `src/app/actions.ts`:

- cartão novo: por volta da linha 2511;
- cartão salvo: por volta da linha 2832;
- PIX/boleto: `settleNonCardInvoice`, por volta da linha 1350;
- PIX direto possui `fulfillCheckoutAfterPixPaid`, por volta da linha 1419.

Chamar provisionamento em `after()`, depois da confirmação de pagamento. Criar subscription antes, ou serviço deve procurar subscription pela `lastInvoiceId`/usuário.

### 4. Remover UI e proteção servidor

Arquivos principais:

- `src/app/vps/configure/[id]/page.tsx`
- `src/app/vds/configure/[id]/page.tsx`
- `src/app/vps-windows/configure/[id]/page.tsx`
- `src/app/vps-armazenamento/configure/[id]/page.tsx`

Remover categorias `apps` e `blockchain`; remover cards `cpanel` e `plesk-win`; remover estados, query params, modais, seções de Object Storage, Monitoring e expansões VDS. Webmin e Webmin + LAMP permanecem em `panels`.

Também sanitizar/rejeitar esses valores em `createVpsInvoice` para URLs antigas não gerarem cobrança por recurso removido.

## Validação

- `bun test src/lib/contabo/*.test.ts`
- type-check isolado dos novos arquivos.
- O type-check total já falhou anteriormente em erro preexistente: `src/lib/server/domains/namecheap-gmail-verification.test.ts` exige `preconnect` em mock de `fetch`.
- Commit obrigatório com trailer `Co-authored-by: Codex <noreply@openai.com>`.
