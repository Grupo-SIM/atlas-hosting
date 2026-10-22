-- Local delivery only. Review duplicate historical subscriptions before applying.
ALTER TABLE vps_subscriptions ADD COLUMN initial_invoice_id uuid REFERENCES invoices(id);
-- Backfill only unambiguous original invoices; renewal last_invoice_id is not original.
UPDATE vps_subscriptions s SET initial_invoice_id = s.last_invoice_id
FROM invoices i WHERE i.id = s.last_invoice_id
AND NOT COALESCE((i.metadata->>'isRenewal')::boolean, false)
AND (SELECT count(*) FROM vps_subscriptions d WHERE d.last_invoice_id = s.last_invoice_id) = 1;
CREATE UNIQUE INDEX vps_subscriptions_initial_invoice_id_unique ON vps_subscriptions(initial_invoice_id);
