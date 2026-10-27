"use client";

import { useId } from "react";
import { IMaskInput } from "react-imask";
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebouncedInput } from "@/hooks/use-debounced-input";

export function PaymentField({
  label,
  name,
  autoComplete,
  placeholder,
  value,
  onChange,
  mask,
  secret,
  disabled,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  mask?: string;
  secret?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const [local, setLocal] = useDebouncedInput(value, onChange);
  const common = {
    autoComplete,
    disabled,
    id,
    name,
    placeholder,
    required: true,
    type: secret ? "password" : "text",
    value: local,
  };
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label} <span className="text-destructive">*</span>
      </Label>
      {mask ? (
        <IMaskInput
          {...common}
          className={inputClasses}
          inputMode="numeric"
          mask={mask}
          onAccept={(next: string) => setLocal(next)}
        />
      ) : (
        <Input
          {...common}
          onChange={event => setLocal(event.currentTarget.value)}
        />
      )}
    </div>
  );
}
