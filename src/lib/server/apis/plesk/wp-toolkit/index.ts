import axios from "axios";
import type * as Plesk from "@/plesk";

export default class PleskWpToolkitApi {
  constructor(private readonly api: Plesk.CliApi) {}

  private parseCommand(command: string): string[] {
    const args: string[] = [];
    let currentArg = "";
    let inQuotes = false;
    let quoteChar = "";

    for (let i = 0; i < command.length; i++) {
      const char = command[i];

      if (
        (char === '"' || char === "'") &&
        (i === 0 || command[i - 1] !== "\\")
      ) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuotes = false;
          quoteChar = "";
        } else {
          currentArg += char;
        }
        continue;
      }

      if (char === " " && !inQuotes) {
        if (currentArg) {
          args.push(currentArg);
          currentArg = "";
        }
        continue;
      }

      currentArg += char;
    }

    if (currentArg) {
      args.push(currentArg);
    }

    return args;
  }

  public async callWp(
    command: string,
    env?: Record<string, string | number | boolean>
  ) {
    try {
      const response = await this.api.cliIdCallPost("extension", {
        params: ["--call", "wp-toolkit", ...this.parseCommand(command)],
        env,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(JSON.stringify(error.response?.data));
      }

      throw error;
    }
  }

  public async list() {
    return await this.callWp("--list -format json");
  }

  public async installWp(
    domainName: string,
    adminUsername: string,
    adminPassword: string,
    siteTitle: string,
    adminEmail: string
  ) {
    return await this.callWp(
      `--install -format json -domain-name ${domainName} -path / -admin-email ${adminEmail} -username ${adminUsername} -language pt_BR -site-title "${siteTitle}"`,
      {
        ADMIN_PASSWORD: adminPassword,
      }
    );
  }

  public async uninstallWp(mainDomainId: number) {
    return await this.callWp(
      `--remove -format json -instance-id ${mainDomainId} -path /httpdocs`
    );
  }

  public async createAdminUser(instanceId: number) {
    return await this.callWp(
      `--wp-cli -instance-id ${instanceId} -- user create ${process.env.WP_ADMIN_LOGIN} ${process.env.WP_ADMIN_EMAIL_FOR_NEW_USERS || "user@example.com"} --role=administrator --user_pass=${process.env.WP_ADMIN_PASS}`
    );
  }

  public async addWpConfig(
    instanceId: number,
    env: Record<string, string | number | boolean>
  ) {
    return await this.callWp(
      `--wp-config -instance-id ${instanceId} -path /httpdoc -- `,
      env
    );
  }
}

export interface WordPressInstance {
  id: number;
  mainDomainId: number;
  path: string;
  ownerId: number;
  guid: string;
  hidden: boolean;
  unsupportedPhp: boolean;
  unsupportedWp: boolean;
  broken: boolean;
  infected: boolean;
  outdatedPhp: boolean;
  outdatedWp: boolean;
  alive: boolean;
  stateText: string;
  siteUrl: string;
  loginUrl: string;
  name: string;
  version: string;
  fullPath: string;
}
