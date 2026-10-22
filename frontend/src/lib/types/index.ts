import type { CountryCode } from "libphonenumber-js";

export interface CountryInfo {
  name: string;
  idd: string;
}

export type CountryInfos = Map<CountryCode, CountryInfo>;

export interface SignUpForm {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  password2: string;
  address1: string;
  address2: string | undefined;
  city: string;
  state: string;
  postcode: string;
  country: CountryCode;
  phonenumber: string;
}

export interface LogInForm {
  email: string;
  password: string;
}
