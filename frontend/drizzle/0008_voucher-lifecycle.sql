-- Local artifact only. Apply through normal deployment process.
ALTER TABLE invoices ADD COLUMN voucher_consumed boolean NOT NULL DEFAULT false;
ALTER TABLE invoices ADD COLUMN original_amount double precision;
ALTER TABLE invoices ADD COLUMN voucher_discount integer NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN voucher_id uuid REFERENCES vouchers(id);
ALTER TABLE invoices ADD CONSTRAINT invoice_voucher_discount_nonnegative CHECK (voucher_discount >= 0);

-- Covers every payment settlement path, including repeated webhook deliveries.
CREATE FUNCTION atlas_invoice_voucher_lifecycle() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'paid' AND NOT OLD.voucher_consumed AND NEW.voucher_id IS NOT NULL THEN
    UPDATE vouchers SET current_uses = current_uses + 1 WHERE id = NEW.voucher_id;
    NEW.voucher_consumed := true;
  END IF;
  -- Payments already created require reconciliation; keep their reservation.
  IF NEW.status = 'expired' AND NOT OLD.voucher_consumed
     AND NEW.metadata->>'simpayPaymentId' IS NULL
     AND NEW.metadata->>'pixTransactionId' IS NULL
     AND NEW.metadata->>'domTransactionId' IS NULL
     AND NEW.metadata->>'paymentStartedAt' IS NULL THEN
    NEW.amount := COALESCE(NEW.original_amount, NEW.amount);
    NEW.original_amount := NULL;
    NEW.voucher_id := NULL;
    NEW.voucher_discount := 0;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER atlas_invoice_voucher_lifecycle BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION atlas_invoice_voucher_lifecycle();
