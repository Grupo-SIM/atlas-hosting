import axios from "axios";
import type * as Plesk from "plesk-api";

export default class PleskWpToolkitApi {
  constructor(private readonly api: Plesk.CliApi) {}

  private async callWp(command: string) {
    try {
      const response = await this.api.cliIdCallPost("extension", {
        params: ["--call", "wp-toolkit", ...command.split(" ")],
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
    return await this.callWp("--list");
  }

  public async installWp(domainName: string) {
    return await this.callWp(
      `--install -format json -domain-name ${domainName} -path /`,
    );
  }
}
