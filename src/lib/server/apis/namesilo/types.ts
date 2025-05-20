import { Name } from "drizzle-orm";

export interface NamesiloResponse<T> {
  request: NamesiloRequest;
  reply: NamesiloReply<T>;
}

export type NamesiloReply<T> = {
  code: number;
  detail: string;
} & T;

export interface CheckRegisterAvailabilityResponse<T extends string | string[]> {
  available?: T extends string[] ? Domain[]: Available;
  unavailable?: T extends string[] ? string[]: Unavailable;
}

export interface Available {
  domain: Domain;
}

export interface Unavailable {
  domain: string;
}

export interface Domain {
  domain: string;
  price: number;
  renew: number;
  premium: number;
  duration: number;
}

export interface NamesiloRequest {
  operation: string;
  ip: string;
}

export enum NamesiloBoolean {
  True = "1",
  False = "0",
}

export interface RegisterDomainParams {
  domain: string;
  years: number;
  payment_id?: number;
  portfolio?: number;
  private?: NamesiloBoolean;
  coupon?: string;
}


export interface CreateContactParams {
  /**
     * First Name
	*/
  fn: string;
  /**
     * Last Name
	*/
  ln: string;
  /**
     * Mailing address
	*/
  ad: string;
  /**
     * City
	*/
  cy: `${string[0]}${string[0]}`;
  /**
     * State
	*/
  st: string;
  /**
     * Zip Code
	*/
  zp: string;
  /**
     * Country
	*/
  ct: string;
  /**
     * Email
	*/
  em: string;
  /**
     * Phone Number
	*/
  ph: string;
}

export interface CreateContactResponse {
  contact_id: number;
}

export interface RegistrationData {
  registration: number;
  transfer: number;
  renew: number;
}

export type GetPricesResponse = Record<string, RegistrationData>;

export interface NamesiloDomainInfo {
  created:                     string;
  expires?:                     string;
  status:                      string;
  locked:                      string;
  private:                     string;
  auto_renew?:                  string;
  traffic_type:                string;
  email_verification_required: string;
  portfolio:                   string;
  forward_url:                 string;
  forward_type:                string;
  nameservers:                 Nameserver[];
  contact_ids:                 ContactIDS;
}

export interface ContactIDS {
  registrant:     string;
  administrative: string;
  technical:      string;
  billing:        string;
}

export interface Nameserver {
  nameserver: string;
  position:   number;
}

export interface NamesiloDomain {
  domains: ListDomainDomain[] | { domain: ListDomainDomain };
  pager?:   Pager;
}

export interface ListDomainDomain {
  domain:  string;
  created: string;
  expires: string;
  maxBid?: number;
}

export interface Pager {
  page:     number;
  pageSize: string;
  total:    string;
}

export interface ListDomainsParams {
  page?: number;
  pageSize?: number;
  portfolioId?: number;
}

export interface ListDnsRecordsResponse {
  resource_record: ResourceRecord[];
}

export interface ResourceRecord {
  record_id: string;
  type:      string;
  host:      string;
  value:     string;
  ttl:       string;
  distance:  string;
}

export interface ListNameServersResponse {
  hosts: NameServer[];
}

export interface NameServer {
  host: string;
  ip: string;
}