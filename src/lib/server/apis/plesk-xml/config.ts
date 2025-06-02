if (!process.env.PLESK_XML_API_URL) {
  throw new Error("Missing PLESK_XML_API_URL environment variable");
}
if (!process.env.PLESK_API_LOGIN) {
  throw new Error("Missing PLESK_API_LOGIN environment variable");
}
if (!process.env.PLESK_API_PASSWORD) {
  throw new Error("Missing PLESK_API_PASSWORD environment variable");
}
if (!process.env.PLESK_API_KEY) {
  throw new Error("Missing PLESK_API_KEY environment variable");
}

export const PLESK_XML_API_URL = process.env.PLESK_XML_API_URL;
export const PLESK_API_LOGIN = process.env.PLESK_API_LOGIN;
export const PLESK_API_PASSWORD = process.env.PLESK_API_PASSWORD;
export const PLESK_API_KEY = process.env.PLESK_API_KEY;
