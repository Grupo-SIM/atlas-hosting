# Atlas Plesk DNS Design

## Objective

Allow an authenticated organization to claim an existing domain through a DNS TXT record and manage its existing Plesk DNS zone without changing hosting, nameservers, or billing.

## Ownership

The transfer form creates an inactive `organization_domains` row. It displays a deterministic TXT token derived from the domain and organization identity. Verification queries public DNS for that TXT record, then changes only that row to `active = true`.

## DNS management

The `/dns` page treats Plesk as the source of truth. It reads Plesk records and performs record-level create, update, and delete calls. Every server action first verifies that the requested domain is active in the caller's organization. It never bulk-replaces a DNS zone.

## Safety constraints

- Never change a domain's A, NS, MX, or any other DNS record during claim.
- Never create, delete, or migrate database schema or production data.
- Do not use Namecheap DNS operations for Plesk-managed zones.
- Preserve existing Plesk records unless the authorized user explicitly edits or deletes that exact record.
