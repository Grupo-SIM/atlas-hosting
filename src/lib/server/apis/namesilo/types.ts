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
	contact_id?: number;
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
     * Country
	*/
	cy: string;
	/**
     * State
	*/
	st: string;
	/**
     * Zip Code
	*/
	zp: string;
	/**
     * City
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