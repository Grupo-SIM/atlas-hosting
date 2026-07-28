import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type Method,
} from "axios";
import { DeSECError, DeSECRateLimitError } from "./errors";

export class DeSECClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private readonly BASE_URL = "https://desec.io/api/v1";
  private readonly DYNDNS_URL = "https://update.dedyn.io";
  private readonly DYNDNS_IPV6_URL = "https://update6.dedyn.io";

  constructor(token?: string) {
    this.axiosInstance = axios.create({
      baseURL: this.BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (token) {
      this.setToken(token);
    }

    // Interceptor for error handling and rate limit retries
    this.axiosInstance.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const { config, response } = error;

        if (response) {
          const statusCode = response.status;
          const responseBody = response.data as any;
          const errorMessage =
            responseBody?.detail || responseBody?.message || error.message;

          if (statusCode === 429) {
            const retryAfter = Number.parseInt(
              response.headers["retry-after"] || "0",
              10
            );
            // For simplicity, we'll just throw the rate limit error.
            // A more advanced client would implement automatic retries here.
            throw new DeSECRateLimitError(
              `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
              retryAfter,
              responseBody
            );
          }
          throw new DeSECError(
            `API Error (${statusCode}): ${errorMessage}`,
            statusCode,
            responseBody
          );
        }

        // If no response, it's a network error or request setup issue
        throw new DeSECError(`Network Error: ${error.message}`, 0, null);
      }
    );
  }

  /**
   * Sets the authentication token for subsequent requests.
   * @param token The deSEC API token secret.
   */
  public setToken(token: string): void {
    this.token = token;
    this.axiosInstance.defaults.headers.common.Authorization = `Token ${this.token}`;
  }

  /**
   * Clears the authentication token.
   */
  public clearToken(): void {
    this.token = null;
    delete this.axiosInstance.defaults.headers.common.Authorization;
  }

  /**
   * Generic request method for deSEC API.
   * @param method HTTP method (GET, POST, PATCH, PUT, DELETE).
   * @param url The API endpoint path (e.g., '/auth/account/').
   * @param data Request body for POST, PATCH, PUT.
   * @param config Additional Axios request configuration.
   * @returns A Promise that resolves with the response data.
   */
  public async request<T>(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.request<T>({
      data,
      method,
      url,
      ...config,
    });
    return response.data;
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("GET", url, undefined, config);
  }

  public post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>("POST", url, data, config);
  }

  public patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>("PATCH", url, data, config);
  }

  public put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>("PUT", url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("DELETE", url, undefined, config);
  }

  /**
   * Performs a DynDNS update request.
   * This uses a separate axios instance as the base URL and authentication differ.
   * @param domainName The full domain name to update.
   * @param tokenSecret The token secret for authentication.
   * @param ipv4 Optional IPv4 address(es) (comma-separated).
   * @param ipv6 Optional IPv6 address(es) (comma-separated).
   * @param useIpv6OnlyEndpoint If true, uses update6.dedyn.io (removes IPv4 if not explicitly provided).
   * @param preserveIpv4 If true, preserves existing IPv4 records if no new IPv4 is provided.
   * @param preserveIpv6 If true, preserves existing IPv6 records if no new IPv6 is provided.
   * @returns A Promise resolving to 'good' on success, or an error string.
   */
  public async dynDNSUpdate(
    domainName: string,
    tokenSecret: string,
    ipv4?: string | string,
    ipv6?: string | string,
    useIpv6OnlyEndpoint = false,
    preserveIpv4 = false,
    preserveIpv6 = false
  ): Promise<string> {
    const updateUrl = useIpv6OnlyEndpoint
      ? this.DYNDNS_IPV6_URL
      : this.DYNDNS_URL;

    const params = new URLSearchParams();
    params.append("hostname", domainName);

    if (ipv4 !== undefined) {
      params.append("myipv4", Array.isArray(ipv4) ? ipv4.join(",") : ipv4);
    } else if (preserveIpv4) {
      params.append("myipv4", "preserve");
    } else if (useIpv6OnlyEndpoint) {
      // If using update6.dedyn.io and no ipv4 is provided, explicitly delete it
      params.append("myipv4", "");
    }

    if (ipv6 !== undefined) {
      params.append("myipv6", Array.isArray(ipv6) ? ipv6.join(",") : ipv6);
    } else if (preserveIpv6) {
      params.append("myipv6", "preserve");
    } else if (!useIpv6OnlyEndpoint) {
      // If not using update6.dedyn.io and no ipv6 is provided, explicitly delete it
      params.append("myipv6", "");
    }

    try {
      const response = await axios.get<string>(updateUrl, {
        auth: {
          password: tokenSecret,
          username: domainName,
        },
        params,
        // Alternatively, for HTTP Token Authentication:
        // headers: {
        //   'Authorization': `Token ${tokenSecret}`
        // }
      });
      return response.data; // Should be 'good' on success
    } catch (error: any) {
      if (error.response) {
        throw new DeSECError(
          `DynDNS Error (${error.response.status}): ${error.response.data}`,
          error.response.status,
          error.response.data
        );
      }
      throw new DeSECError(`DynDNS Network Error: ${error.message}`, 0, null);
    }
  }
}
