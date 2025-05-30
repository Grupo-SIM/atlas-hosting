import {
  PLESK_API_LOGIN,
  PLESK_API_PASSWORD,
} from "@/lib/server/apis/email/config";
import axios, { type AxiosError } from "axios";
import { XMLParser } from "fast-xml-parser";
import { create } from "xmlbuilder2";
import { PLESK_API_KEY, PLESK_XML_API_URL } from "./config";
import type {
  AddMailNamePayload,
  GetMailNamesResult,
  MailName,
  PleskApiError,
  PleskPacket,
} from "./types";

const axiosInstance = axios.create({
  adapter: "xhr",
});

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: true, // Attempt to parse numbers and booleans
  isArray: (tagName, jPath, isLeafNode, isAttribute) => {
    // Treat 'mailname' under 'get_info.result' as an array always for consistency
    if (jPath === "packet.mail.get_info.result.mailname") return true;
    return false;
  },
});

interface PleskRequestOptions {
  operator: string; // e.g., 'mail'
  operation: string; // e.g., 'get' or 'add_mail_name'
  params: object;
}

async function requestPleskApi<TResponsePayload>(
  options: PleskRequestOptions
): Promise<TResponsePayload> {
  const xmlRequest = create({ version: "1.0", encoding: "UTF-8" })
    .ele("packet")
    .ele(options.operator)
    .ele(options.operation)
    .ele(options.params)
    .up()
    .up()
    .up()
    .end({ prettyPrint: true });

  console.log('Plesk API Request XML being sent:', xmlRequest); // Log the generated XML

  try {
    const response = await axios.post(PLESK_XML_API_URL, xmlRequest, {
      headers: {
        "Content-Type": "text/xml",
        HTTP_AUTH_LOGIN: PLESK_API_LOGIN,
        HTTP_AUTH_PASSWD: PLESK_API_PASSWORD,
        KEY: PLESK_API_KEY,
      },
    });

    console.log(response.data);

    const parsedResponse = xmlParser.parse(
      response.data
    ) as PleskPacket<TResponsePayload>;

    if (
      parsedResponse.packet.system &&
      parsedResponse.packet.system.status === "error"
    ) {
      const error = parsedResponse.packet.system;
      console.error("Plesk API System Error:", error);
      throw new Error(
        `Plesk API System Error ${error.errcode}: ${error.errtext}`
      );
    }

    // Navigate to the actual result object
    // e.g. parsedResponse.packet.mail.get.result
    const operationResultContainer =
      'system' in parsedResponse.packet 
        ? undefined 
        : parsedResponse.packet[options.operator]?.[options.operation];
    if (!operationResultContainer || !operationResultContainer.result) {
      console.error("Unexpected Plesk API response structure:", parsedResponse);
      throw new Error(
        "Unexpected Plesk API response structure: result not found."
      );
    }

    const result = operationResultContainer.result;

    if (result.status === "error") {
      const error = result as PleskApiError; // Type assertion
      console.error("Plesk API Operation Error:", error);
      throw new Error(
        `Plesk API Operation Error ${error.errcode}: ${error.errtext}`
      );
    }

    // The actual payload might be directly in result, or nested further
    // For 'get' operations, the data is often directly under 'result'
    // For 'add', 'set', 'del', it might just be status 'ok' and an 'id'.
    return result as TResponsePayload;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(
        "Axios Error calling Plesk API:",
        axiosError.message,
        axiosError.response?.data
      );
      throw new Error(
        `Network or HTTP error calling Plesk API: ${axiosError.message}`
      );
    }
    console.error("Error in requestPleskApi:", error);
    throw error; // Re-throw other errors (like parsing or Plesk API errors)
  }
}

export async function getMailAccounts(pleskId: number): Promise<MailName[]> {
  if (typeof pleskId !== "number" || Number.isNaN(pleskId)) {
    console.error("Invalid pleskId passed to getMailAccounts:", pleskId);
    throw new Error(
      "Invalid pleskId provided for fetching mail accounts. It must be a valid number."
    );
  }

  const response = await requestPleskApi<GetMailNamesResult>({
    operator: "mail",
    operation: "get_info", // Corrected operation name
    params: {
      filter: { "site-id": pleskId },
      mailbox: {},
      "mailbox-usage": {},
      forwarding: {},
      autoresponder: {},
      // aliases: {}
    },
  });
  if (response.mailname) {
    return Array.isArray(response.mailname)
      ? response.mailname
      : [response.mailname];
  }
  return [];
}

export async function addMailAccount(
  siteId: number,
  mailAccountData: AddMailNamePayload["mailname"]
): Promise<{ id: number }> {
  const payload: AddMailNamePayload = {
    "site-id": siteId,
    mailname: mailAccountData,
  };

  const response = await requestPleskApi<{ id: number }>({
    operator: "mail",
    operation: "add_mail_name",
    params: payload,
  });

  if (!response.id) {
    throw new Error("Failed to create mail account: No ID returned.");
  }

  return { id: response.id }; // Assuming 'id' is returned on successful creation
}

export async function deleteMailAccount(mailNameId: number): Promise<void> {
  await requestPleskApi<void>({
    // Expects no specific payload on success, just status 'ok'
    operator: "mail",
    operation: "remove_mail_name", // As per Plesk docs
    params: {
      filter: { mn_id: mailNameId }, // mn_id is the mailname ID
    },
  });
}

// --- Example of how to build more complex XML for specific operations ---
// This is a helper, you might integrate it or call it from specific functions
/*
function buildMailNameXml(data: AddMailNamePayload['mailname']): object {
  const mailnameNode: any = { name: data.name };
  if (data.mailbox) {
    mailnameNode.mailbox = { enabled: data.mailbox.enabled };
    if (data.mailbox.quota !== undefined) {
      mailnameNode.mailbox.quota = data.mailbox.quota;
    }
  }
  if (data.password) {
    mailnameNode.password = { value: data.password.value, type: data.password.type };
  }
  // Add other elements like mailgroup, autoresponder, forward, antispam, antivirus here
  return mailnameNode;
}
*/

// You would continue to add more functions here for other operations:
// - updateMailAccount
// - getMailAliases, addMailAlias, deleteMailAlias
// - manageAutoresponders, etc.
