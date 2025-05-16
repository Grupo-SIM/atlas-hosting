import axios from "axios";
import type * as Plesk from "plesk-api";

export default class SubscriptionApi {
  constructor(private readonly api: Plesk.CliApi) {}

  private async callSubscription(command: string) {
    try {
      const response = await this.api.cliIdCallPost("subscription", {
        params: command.split(" ").concat(["--format", "json"]),
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
    return await this.callSubscription("--list");
  }

  public async createSubscription() {}
}

interface SubscriptionCreateRequest {
    domain: string;
    customer_id: number;

}