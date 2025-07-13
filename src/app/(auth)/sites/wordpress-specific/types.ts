import type { WpPluginList } from "@/lib/server/apis/plesk/wp-toolkit/wp-cli";

export interface WordPressPluginInfo {
  update_id: number;
  title?: string;
  name: string;
  version?: string;
  status: "active" | "inactive";
  updateAvailable?: boolean;
  description?: string;
}

export interface WordPressSiteInfo {
  id: number;
  instanceId: number;
  name: string;
  domain: string;
  path: string;
  status: string;
  version: string;
  loginUrl: string;
  url?: string; // Computed from domain + path
  createdAt?: string;
  plugins?: WpPluginList[];
  themes?: WordPressThemeInfo[];
  users?: WordPressUserInfo[];
  hasUpdates?: boolean;
  lastBackup?: string;
  updatesAvailable?: {
    core?: boolean;
    plugins?: WpPluginList[];
    themes?: WordPressThemeInfo[];
  };
}

export interface WordPressUserInfo {
  ID: number;
  user_login: string;
  display_name: string;
  user_email: string;
  user_registered: string;
  roles: string;
}

export interface WordPressThemeInfo {
  name: string;
  status: "inactive" | "active";
  update: "none" | "available";
  version: `${number}`;
  update_version: `${number}` | "";
  auto_update: "on" | "off";
  update_package: null | string;
  update_id: string;
  title: string;
  description: string;
}
