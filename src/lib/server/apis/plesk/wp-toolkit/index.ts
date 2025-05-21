import axios from "axios";
import type * as Plesk from "@/plesk";

export default class PleskWpToolkitApi {
  constructor(private readonly api: Plesk.CliApi) {}

  private async callWp(command: string, env?: Record<string, string>) {
    try {
      const response = await this.api.cliIdCallPost("extension", {
        params: ["--call", "wp-toolkit", ...command.split(" ")],
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
    adminPassowrd: string
  ) {
    return await this.callWp(
      `--install -format json -domain-name ${domainName} -path / -set-id 8 -username ${adminUsername} -language pt_BR`,
      {
        ADMIN_PASSWORD: adminPassowrd,
      }
    );
  }

  public async uninstallWp(mainDomainId: number) {
    return await this.callWp(
      `--remove -format json -instance-id ${mainDomainId} -path /httpdocs`
    );
  }
}
