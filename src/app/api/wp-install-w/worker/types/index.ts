import type { HostingProperties } from "@/app/api/wp-install-w/worker/types/hosting";
import type { LimitsProperties } from "@/app/api/wp-install-w/worker/types/limits";
import type { PhpConfiguration } from "@/app/api/wp-install-w/worker/types/php-ini";

export interface AddWebspaceParams {
  gen_setup: WebspaceGenSetup;
  hosting: WebspaceHosting;
  performance: WebspacePerformance;
  // limits: WebspaceHostingLimit[]; // Missing?
  "php-settings": WebspacePhpSettings[];
}

export interface SetWebspaceParams {
  gen_setup?: WebspaceGenSetup;
  hosting?: WebspaceHosting;
  performance?: WebspacePerformance;
  // limits: WebspaceHostingLimit[]; // Missing?
  "php-settings"?: WebspacePhpSettings[];
}


export interface WebspaceGenSetup {
  /** Nome do domínio */
  name: string;
  /** Tipo de hosting (sempre "vrt_hst" em nosso caso) */
  htype: "vrt_hst";
  /** Organization["pleskId"] */
  "owner-id": string;
  /** IP do servidor */
  ip_address: string; // Server IP

  /**
   * 0 - active
   *
   * 16 - disabled by Plesk Administrator
   *
   * 32 - disabled by Plesk reseller
   *
   * 64 - disabled by a customer
   */
  status?: 0 | 16 | 64;

  /** ID do usuário em aplicaçoes externas (exemplo: Atlas) */
  "owner-external-id"?: string;

  /** GUUID do usuário */
  "owner-guid"?: string;

  /** Login do usuário */
  "owner-login"?: string;
}

export interface WebspaceHosting {
  vrt_hst: {
    property: { name: keyof HostingProperties; value: string | number }[];
  };
}

export interface WebspaceHostingLimit {
  limit: { name: keyof LimitsProperties; value: string | number };
}

export interface WebspacePerformance {
  /** Possibly something inbetween 5G to 30G */
  bandwidth: number;

  /** IMPORTANT! Relates to user subscription */
  max_connections: number;
}

export interface WebspacePhpSettings {
  setting: { name: keyof PhpConfiguration; value: string | number };
}
