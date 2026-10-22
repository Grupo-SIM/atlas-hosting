-- These domains were linked as Namecheap purchases but are registered elsewhere.
-- Keep their existing Cloudflare zone and DNS connection state intact.
UPDATE "organization_domains"
SET "registrar_provider" = 'external'
WHERE "domain" IN ('simintpay.com', 'teron.app')
  AND "registrar_provider" = 'namecheap';
