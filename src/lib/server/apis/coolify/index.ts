import axios, { type AxiosInstance } from "axios";

export class CoolifyApi {
  private apiUrl: string;
  private apiToken: string;
  public coolifyAxios: AxiosInstance;

  constructor() {
    this.apiUrl = process.env.COOLIFY_API_URL as string;
    this.apiToken = process.env.COOLIFY_API_TOKEN as string;

    this.coolifyAxios = axios.create({
      baseURL: this.apiUrl,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  public async listApplications() {
    try {
      const response = await this.coolifyAxios.get("/applications");
      return response.data;
    } catch (error) {
      console.error("Error listing applications:", error);
      throw error;
    }
  }

  public async getApplicationStats(applicationId: string) {
    try {
      const response = await this.coolifyAxios.get(
        `/applications/${applicationId}/stats`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error getting stats for application ${applicationId}:`,
        error
      );
      throw error;
    }
  }
}

const coolifyApi = new CoolifyApi();
export default coolifyApi;
