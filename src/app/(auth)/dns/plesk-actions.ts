"use server";

export interface DnsActionResult {
  success: boolean;
  message: string;
  errors?: { field?: string; message: string }[];
}

const dnsEditingDisabled: DnsActionResult = {
  message: "A edição de DNS não está disponível na Atlas. Gerencie os registros no provedor DNS atual.",
  success: false,
};

export async function addPleskDnsRecordAction(
  _prevState: DnsActionResult | null,
  _formData: FormData
): Promise<DnsActionResult> {
  return dnsEditingDisabled;
}

export async function updatePleskDnsRecordAction(
  _prevState: DnsActionResult | null,
  _formData: FormData
): Promise<DnsActionResult> {
  return dnsEditingDisabled;
}

export async function deletePleskDnsRecordAction(
  _prevState: DnsActionResult | null,
  _formData: FormData
): Promise<DnsActionResult> {
  return dnsEditingDisabled;
}