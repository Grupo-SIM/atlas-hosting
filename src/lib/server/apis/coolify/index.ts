import axios from "axios";
import type { User } from "@/lib/db/schema";
import type { Resource } from "./types";

export class CoolifyApi {
  private readonly client = axios.create({
    baseURL: process.env.COOLIFY_API_URL,
    headers: {
      Authorization: `Bearer ${process.env.COOLIFY_API_KEY}`,
    },
  });

  constructor(readonly _user: User) {}

  public async getAvailableResources(): Promise<Resource[]> {
    return await this.client
      .get<Resource[]>("/resources")
      .then(response => response.data);
  }
}
