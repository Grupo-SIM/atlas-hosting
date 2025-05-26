import { db } from "@/lib/db";
import { ipLocationCache } from "@/lib/db/schema";
import axios from "axios";
import { eq } from "drizzle-orm";

export class Ip2Location {
  private readonly apiKey = process.env.IP2LOCATION_API_KEY;

  public async getLocation(ip: string): Promise<IpInfo> {
    const cachedInfo = await this.getCachedLocation(ip);

    if (cachedInfo) {
      return cachedInfo;
    }

    const freshInfo = await this.getFreshLocation(ip);

    if (!freshInfo) {
      throw new Error(`Failed to fetch location for IP: ${ip}`);
    }

    await this.cacheLocation(freshInfo);

    return freshInfo;
  }

  private parseRawIpInfo(raw: RawIpInfo): IpInfo {
    return {
      ip: raw.ip,
      countryCode: raw.country_code,
      countryName: raw.country_name,
      regionName: raw.region_name,
      cityName: raw.city_name,
      latitude: raw.latitude,
      longitude: raw.longitude,
      zipCode: raw.zip_code,
      timeZone: raw.time_zone,
      asn: raw.asn,
      as: raw.as,
      isProxy: raw.is_proxy,
    };
  }

  private async cacheLocation(ipInfo: IpInfo): Promise<void> {
    await db
      .insert(ipLocationCache)
      .values(ipInfo)
      .onConflictDoUpdate({
        target: ipLocationCache.ip,
        set: {
          ...ipInfo,
          updatedAt: new Date(),
        },
      });
  }

  private async getCachedLocation(ip: string): Promise<IpInfo | null> {
    const cached = await db.query.ipLocationCache.findFirst({
      where: eq(ipLocationCache.ip, ip),
    });

    return cached || null;
  }

  private async getFreshLocation(ip: string): Promise<IpInfo> {
    const { data } = await axios.get<RawIpInfo>(
      `https://api.ip2location.io/?key=${this.apiKey}&ip=${ip}`
    );

    return this.parseRawIpInfo(data);
  }
}

const ip2Location = new Ip2Location();

export default ip2Location;

interface RawIpInfo {
  ip: string;
  country_code: string;
  country_name: string;
  region_name: string;
  city_name: string;
  latitude: number;
  longitude: number;
  zip_code: string;
  time_zone: string;
  asn: string;
  as: string;
  is_proxy: boolean;
}

export interface IpInfo {
  ip: string;
  countryCode: string;
  countryName: string;
  regionName: string;
  cityName: string;
  latitude: number;
  longitude: number;
  zipCode: string;
  timeZone: string;
  asn: string;
  as: string;
  isProxy: boolean;
}
