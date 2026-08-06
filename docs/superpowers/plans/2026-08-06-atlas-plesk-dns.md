# Atlas Plesk DNS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let organizations claim an external domain with a DNS TXT record and manage its Plesk DNS records safely.

**Architecture:** Add a Plesk DNS adapter that normalizes Plesk records for the Atlas UI and executes record-level operations. Replace the external-domain A-record check with deterministic TXT ownership verification, retaining the existing `organization_domains.active` column and avoiding schema changes.

**Tech Stack:** Next.js server actions, TypeScript, Drizzle ORM, Plesk REST API, `dns-query`, React.

## Global Constraints

- Do not execute migrations, `db:push`, SQL, or production database commands.
- Claiming a domain must not modify DNS records, Plesk subscriptions, nameservers, hosting, billing, or the domain A record.
- All Plesk DNS writes must be record-level calls; bulk zone replacement is prohibited.
- All DNS reads and writes must authorize the domain against the active organization.

---

### Task 1: Plesk DNS adapter and authorization helpers

**Files:**
- Create: `src/lib/server/apis/plesk/dns.ts`
- Create: `src/lib/server/domains/authorization.ts`
- Test: `src/lib/server/apis/plesk/dns.test.ts`

**Interfaces:**
- Produces `PleskDnsRecord`, `listPleskDnsRecords`, `createPleskDnsRecord`, `updatePleskDnsRecord`, `deletePleskDnsRecord`.
- Produces `organizationOwnsActiveDomain(organizationId, domain)`.

- [ ] **Step 1: Write failing adapter and authorization tests**
- [ ] **Step 2: Run the targeted test and confirm failure due to missing modules**
- [ ] **Step 3: Implement normalization, direct Plesk operations, and active-domain ownership lookup**
- [ ] **Step 4: Run the targeted test and confirm it passes**

### Task 2: TXT-based claim flow

**Files:**
- Create: `src/app/(auth)/domain/register/transfer-actions.ts`
- Modify: `src/app/(auth)/domain/register/components/TransferForm.tsx`
- Modify: `src/app/(auth)/domain/register/components/TransferDomainsList.tsx`
- Test: `src/app/(auth)/domain/register/transfer-actions.test.ts`

**Interfaces:**
- Consumes `organizationOwnsActiveDomain` and `pgOrganizationDomains`.
- Produces `addExternalDomainForTransfer` and `verifyExternalDomainTransfer`.

- [ ] **Step 1: Write failing tests for TXT token generation and verification outcomes**
- [ ] **Step 2: Run the targeted test and confirm failure**
- [ ] **Step 3: Implement deterministic TXT token generation and verification without DNS writes**
- [ ] **Step 4: Update transfer copy and actions to show the TXT record and activate only after lookup succeeds**
- [ ] **Step 5: Run the targeted test and confirm it passes**

### Task 3: Plesk-backed DNS editor

**Files:**
- Modify: `src/app/(auth)/dns/utils.ts`
- Modify: `src/app/(auth)/dns/actions.ts`
- Modify: `src/app/(auth)/dns/page.tsx`
- Modify: `src/app/(auth)/dns/components/DnsRecordManager.tsx`
- Test: `src/app/(auth)/dns/actions.test.ts`

**Interfaces:**
- Consumes Plesk DNS adapter and active-domain authorization helper.
- Produces guarded list/create/update/delete actions for one Plesk DNS record.

- [ ] **Step 1: Write failing tests proving unauthorized and inactive domains cannot be mutated**
- [ ] **Step 2: Run the targeted test and confirm failure**
- [ ] **Step 3: Replace Namecheap record loading and bulk `setHosts` mutations with guarded Plesk record operations**
- [ ] **Step 4: Preserve Plesk record IDs and use them for edit/delete UI actions**
- [ ] **Step 5: Run targeted tests, typecheck, and build**
