export interface CheckRegisterAvailabilityResponse {
	request: NamesiloRequest;
	reply: Reply;
}

export interface Reply {
	code: number;
	detail: string;
	available: Available;
}

export interface Available {
	domain: Domain;
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