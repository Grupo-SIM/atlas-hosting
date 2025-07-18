import { User } from "@/coolify";
import axios from "axios";
import { Resource } from "./types";

export class CoolifyApi {
  private readonly client = axios.create({
    baseURL: process.env.COOLIFY_API_URL,
    headers: {
      Authorization: `Bearer ${process.env.COOLIFY_API_KEY}`,
    },
  });

  constructor(private readonly user: User) {}

  public async getAvailableResources(): Promise<Resource[]> {
    return await this.client
      .get<Resource[]>("/resources")
      .then((response) => response.data);
  }
}
