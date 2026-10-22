import type { User } from "@/lib/db/schema";

export interface PleskCliOutput {
  stdout?: string;
  stderr?: string;
  exit_code?: number;
  message?: string;
  error?: string | boolean;
  status?: string;
  admin_url?: string;
  site_url?: string;
  [key: string]: string | number | boolean | undefined | object;
}

export interface InstallRequestEvent {
  domainName: string;
  adminUsername: string;
  adminPassword: string;
  siteName: string;
  adminEmail: string;
  plugins: string[];
}

export interface InstallWpData extends InstallRequestEvent {
  user: User;
  domainName: string;
}
