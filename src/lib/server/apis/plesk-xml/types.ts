import type { HostingProperties } from "@/app/api/wp-install-w/worker/types/hosting";
import type { WebspaceHosting } from "@/app/api/wp-install-w/worker/types/index";

export interface PleskApiError {
  status: "error";
  errcode: number;
  errtext: string;
}

export interface PleskApiSuccess<T> {
  status: "ok";
  result?: T; // Some operations might not have a nested result object
  id?: number; // e.g., for creation operations
  guid?: string;
  // Add other common success fields if any
}

// Generic packet structure
export interface PleskPacket<TResponsePayload> {
  packet:
    | {
        [key: string]: {
          // e.g., 'mail', 'site', 'customer'
          [key: string]: {
            // e.g., 'get_mail_name', 'add_mail_name'
            result: PleskApiSuccess<TResponsePayload> | PleskApiError;
          };
        };
      }
    | {
        system: PleskApiError; // For system-level errors
      };
}

// Specific types for mail operations

export interface MailboxInfo {
  enabled: boolean;
  quota?: number; // in bytes, -1 for unlimited
  description?: string;
}

export interface MailName {
  id: number;
  name: string;
  mailbox?: MailboxInfo;
  site_id: number;
  site_name?: string; // Usually present with site_id
  // Add other properties like antispam, antivirus, forward, autoresponder as needed
}

export interface GetMailNamesResult {
  mailname: MailName[] | MailName; // API returns single object if only one, array otherwise
  // filter_id?: string; // if filter was used
}

export interface AddMailNamePayload {
  "site-id"?: number;
  "site-name"?: string;
  mailname: {
    name: string; // e.g., 'user' for user@domain.com
    mailbox?: { enabled: boolean; quota?: number };
    password?: { value: string; type: "plain" | "crypt" };
    // ... other properties like mailgroup, autoresponder, etc.
  };
}
export interface GetSubscriptionResult {
  status: string;
  "filter-id": string;
  id: number;
  data: SubscriptionResultData;
}

export interface SubscriptionResultData {
  gen_info: SubscriptionResultGenInfo;
  hosting: WebspaceHosting;
  stat: {
    traffic: number;
    subdom: number;
    wu: number;
    box: number;
    redir: number;
    mg: number;
    resp: number;
    maillists: number;
    db: number;
    mssql_db: number;
    traffic_prevday: number;
    domains: number;
    sites: number;
  };
  "resource-usage": {
    resource: { name: string; value: number }[];
    counter: { name: string; value: number }[];
  };
  disk_usage: {
    httpdocs: number;
    httpsdocs: number;
    subdomains: number;
    web_users: number;
    anonftp: number;
    logs: number;
    dbases: number;
    mailboxes: number;
    maillists: number;
    domaindumps: number;
    configs: number;
    chroot: number;
  };
}

export interface SubscriptionResultHostingData {
  name: keyof HostingProperties;
  value: string | number;
}

export interface SubscriptionResultGenInfo {
  cr_date: string;
  name: string;
  "ascii-name": string;
  status: number;
  real_size: number;
  "owner-id": number;
  dns_ip_address: string;
  htype: string;
  guid: string;
  "vendor-guid": string;
  "external-id": string;
  "sb-site-uuid": string;
  description: string;
  "admin-description": string;
}

export interface GetDnsRecordsResult {
  status: string;
  id: number;
  data: {
    "site-id": number;
    type: string;
    host: string;
    value: string;
    opt: string; // e.g 0 0 465 (in SRV, means priority, weight, port)
  };
}
