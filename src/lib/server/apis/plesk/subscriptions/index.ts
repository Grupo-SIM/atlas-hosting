import { User } from "@/lib/db/schema";
import axios from "axios";
import type * as Plesk from "@/plesk";

export default class SubscriptionApi {
  constructor(private readonly api: Plesk.CliApi) {}

  private async callSubscription(command: string) {
    try {
      const response = await this.api.cliIdCallPost("subscription", {
        params: command.split(" "),
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

  public async createSubscription({
    domainName,
    login,
    password,
  }: CreateSubscriptionParameters) {
    return await this.callSubscription(
      `--create ${domainName} -ip ${process.env.SERVER_IP} -login ${login} -passwd "${password}" -hosting true -hst_type phys -php true -php_handler_id fastcgi -ssl true -mail_service true -hard_quota 10G -log-rotate true -seo-redirect www`
    );
  }

  public async getSsl(domainName: string, user: User) {
    return await this.api.cliIdCallPost("extension", {
      params: [
        "--exec",
        "letsencrypt",
        "cli.php",
        "-d",
        domainName,
        "-d",
        `www.${domainName}`,
        "-m",
        user.email,
      ],
    });
  }
}

export interface CreateSubscriptionParameters {
  domainName: string;
  login: string;
  password: string;
}

interface SubscriptionCreateRequest {
  domain: string;
  customer_id: number;
}
