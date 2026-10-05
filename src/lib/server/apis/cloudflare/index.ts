import type {
  CloudflareDnsRecord,
  CloudflareDnsRecordInput,
  CloudflareEnvelope,
  CloudflareZone,
} from "./types";

const API_BASE_URL = "https://api.cloudflare.com/client/v4";
const MAX_ZONE_FILE_BYTES = 256 * 1024;
type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

export class CloudflareApiError extends Error {
  readonly codes: number[];
  readonly status: number;

  constructor(message: string, status: number, codes: number[] = []) {
    super(message);
    this.codes = codes;
    this.name = "CloudflareApiError";
    this.status = status;
  }
}

export class CloudflareApi {
  constructor(
    private readonly token: string,
    private readonly fetcher: Fetcher = fetch
  ) {}

  private async request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<CloudflareEnvelope<T>> {
    if (!this.token)
      throw new CloudflareApiError(
        "CLOUDFLARE_API_TOKEN não está configurado.",
        500
      );

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${this.token}`);
    if (init.body && !(init.body instanceof FormData))
      headers.set("Content-Type", "application/json");

    const response = await this.fetcher(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? ((await response.json()) as CloudflareEnvelope<T>)
      : ({
          errors: [],
          messages: [],
          result: (await response.text()) as T,
          success: response.ok,
        } satisfies CloudflareEnvelope<T>);

    if (!response.ok || !payload.success) {
      const errors = payload.errors || [];
      throw new CloudflareApiError(
        errors.map(error => error.message).join("; ") ||
          `Cloudflare respondeu HTTP ${response.status}.`,
        response.status,
        errors.map(error => error.code)
      );
    }
    return payload;
  }

  async verifyToken() {
    return (
      await this.request<{ id: string; status: string }>("/user/tokens/verify")
    ).result;
  }

  async findZone(domain: string): Promise<CloudflareZone | null> {
    const params = new URLSearchParams({
      match: "all",
      name: domain,
      page: "1",
      per_page: "50",
    });
    const zones = (
      await this.request<CloudflareZone[]>(`/zones?${params.toString()}`)
    ).result;
    return (
      zones.find(zone => zone.name.toLowerCase() === domain.toLowerCase()) ||
      null
    );
  }

  async createZone(domain: string): Promise<CloudflareZone> {
    return (
      await this.request<CloudflareZone>("/zones", {
        body: JSON.stringify({ name: domain, type: "full" }),
        method: "POST",
      })
    ).result;
  }

  async ensureZone(domain: string): Promise<CloudflareZone> {
    return (await this.findZone(domain)) || this.createZone(domain);
  }

  async getZone(zoneId: string): Promise<CloudflareZone> {
    return (await this.request<CloudflareZone>(`/zones/${zoneId}`)).result;
  }

  async deleteZone(zoneId: string): Promise<void> {
    try {
      await this.request(`/zones/${encodeURIComponent(zoneId)}`, { method: "DELETE" });
    } catch (error) {
      if (error instanceof CloudflareApiError && error.status === 404) return;
      throw error;
    }
  }

  async triggerActivationCheck(zoneId: string): Promise<void> {
    await this.request(`/zones/${zoneId}/activation_check`, { method: "PUT" });
  }

  async triggerDnsScan(zoneId: string): Promise<void> {
    await this.request(`/zones/${zoneId}/dns_records/scan/trigger`, {
      method: "POST",
    });
  }

  async listScannedRecords(zoneId: string): Promise<CloudflareDnsRecord[]> {
    const records: CloudflareDnsRecord[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "100",
      });
      const response = await this.request<CloudflareDnsRecord[]>(
        `/zones/${zoneId}/dns_records/scan/review?${params.toString()}`
      );
      records.push(...response.result);
      totalPages = response.result_info?.total_pages || 1;
      page += 1;
    } while (page <= totalPages);
    return records;
  }

  async reviewScannedRecords(
    zoneId: string,
    accepts: CloudflareDnsRecord[],
    rejectIds: string[]
  ): Promise<void> {
    await this.request(`/zones/${zoneId}/dns_records/scan/review`, {
      body: JSON.stringify({
        accepts: accepts.map(record => ({ ...record, proxied: false })),
        rejects: rejectIds.map(id => ({ id })),
      }),
      method: "POST",
    });
  }

  async listDnsRecords(zoneId: string): Promise<CloudflareDnsRecord[]> {
    const records: CloudflareDnsRecord[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "5000",
      });
      const response = await this.request<CloudflareDnsRecord[]>(
        `/zones/${zoneId}/dns_records?${params.toString()}`
      );
      records.push(...response.result);
      totalPages = response.result_info?.total_pages || 1;
      page += 1;
    } while (page <= totalPages);
    return records;
  }

  async createDnsRecord(
    zoneId: string,
    record: CloudflareDnsRecordInput
  ): Promise<CloudflareDnsRecord> {
    return (
      await this.request<CloudflareDnsRecord>(`/zones/${zoneId}/dns_records`, {
        body: JSON.stringify(record),
        method: "POST",
      })
    ).result;
  }

  async updateDnsRecord(
    zoneId: string,
    recordId: string,
    record: CloudflareDnsRecordInput
  ): Promise<CloudflareDnsRecord> {
    return (
      await this.request<CloudflareDnsRecord>(
        `/zones/${zoneId}/dns_records/${recordId}`,
        { body: JSON.stringify(record), method: "PUT" }
      )
    ).result;
  }

  async deleteDnsRecord(zoneId: string, recordId: string): Promise<void> {
    await this.request(`/zones/${zoneId}/dns_records/${recordId}`, {
      method: "DELETE",
    });
  }

  async importZoneFile(zoneId: string, file: File): Promise<void> {
    if (file.size > MAX_ZONE_FILE_BYTES)
      throw new CloudflareApiError(
        "O arquivo de zona deve ter no máximo 256 KiB.",
        400
      );
    const body = new FormData();
    body.set("file", file);
    await this.request(`/zones/${zoneId}/dns_records/import`, {
      body,
      method: "POST",
    });
  }

  async exportZoneFile(zoneId: string): Promise<string> {
    return (await this.request<string>(`/zones/${zoneId}/dns_records/export`))
      .result;
  }

  async upsertDnsRecord(
    zoneId: string,
    record: CloudflareDnsRecordInput
  ): Promise<CloudflareDnsRecord> {
    const existing = (await this.listDnsRecords(zoneId)).find(
      candidate =>
        candidate.name.toLowerCase() === record.name.toLowerCase() &&
        candidate.type === record.type
    );
    return existing
      ? this.updateDnsRecord(zoneId, existing.id, record)
      : this.createDnsRecord(zoneId, record);
  }
}

export const cloudflareApi = new CloudflareApi(
  process.env.CLOUDFLARE_API_TOKEN || ""
);

export type * from "./types";
export { MAX_ZONE_FILE_BYTES };
