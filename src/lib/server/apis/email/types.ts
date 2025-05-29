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
