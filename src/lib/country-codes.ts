import { iso31661 } from "iso-3166";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import type { CountryInfos } from "./types";

function generateCountryCodes(): CountryInfos {
  const countryCodes: CountryInfos = new Map();

  for (const code of getCountries()) {
    const country = iso31661.find((country) => country.alpha2 === code);
    if (country)
      countryCodes.set(code, {
        name: country.name,
        idd: getCountryCallingCode(code),
      });
  }

  return countryCodes;
}

export const CountryCodes = generateCountryCodes();
