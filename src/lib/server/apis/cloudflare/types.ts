export type CloudflareZoneStatus =
  | "initializing"
  | "pending"
  | "active"
  | "moved";

export interface CloudflareZone {
  id: string;
  name: string;
  name_servers: string[];
  original_name_servers?: string[];
  original_registrar?: string;
  status: CloudflareZoneStatus;
  type: "full" | "partial" | "secondary" | "internal";
}

export type CloudflareDnsRecordType =
  | "A"
  | "AAAA"
  | "CAA"
  | "CERT"
  | "CNAME"
  | "DNSKEY"
  | "DS"
  | "HTTPS"
  | "LOC"
  | "MX"
  | "NAPTR"
  | "NS"
  | "OPENPGPKEY"
  | "PTR"
  | "SMIMEA"
  | "SRV"
  | "SSHFP"
  | "SVCB"
  | "TLSA"
  | "TXT"
  | "URI";

export interface CloudflareDnsRecordData {
  algorithm?: number;
  altitude?: number;
  certificate?: string;
  digest?: string;
  digest_type?: number;
  flags?: number;
  key_tag?: number;
  latitude_degrees?: number;
  latitude_direction?: "N" | "S";
  latitude_minutes?: number;
  latitude_seconds?: number;
  longitude_degrees?: number;
  longitude_direction?: "E" | "W";
  longitude_minutes?: number;
  longitude_seconds?: number;
  matching_type?: number;
  order?: number;
  port?: number;
  precision_horz?: number;
  precision_vert?: number;
  preference?: number;
  priority?: number;
  protocol?: number;
  public_key?: string;
  regex?: string;
  replacement?: string;
  selector?: number;
  service?: string;
  size?: number;
  tag?: string;
  target?: string;
  type?: number;
  usage?: number;
  value?: string;
  weight?: number;
}

export interface CloudflareDnsRecord {
  id: string;
  comment?: string | null;
  content: string;
  created_on?: string;
  data?: CloudflareDnsRecordData;
  modified_on?: string;
  name: string;
  priority?: number;
  proxiable?: boolean;
  proxied?: boolean;
  tags?: string[];
  ttl: number;
  type: CloudflareDnsRecordType;
}

export interface CloudflareDnsRecordInput {
  comment?: string;
  content: string;
  data?: CloudflareDnsRecordData;
  name: string;
  priority?: number;
  proxied?: boolean;
  tags?: string[];
  ttl: number;
  type: CloudflareDnsRecordType;
}

export interface CloudflareApiErrorItem {
  code: number;
  message: string;
}

export interface CloudflareEnvelope<T> {
  errors: CloudflareApiErrorItem[];
  messages: CloudflareApiErrorItem[];
  result: T;
  result_info?: {
    count?: number;
    page?: number;
    per_page?: number;
    total_count?: number;
    total_pages?: number;
  };
  success: boolean;
}
