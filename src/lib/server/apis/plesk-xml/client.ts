import type { AddWebspaceParams } from "@/app/api/wp-install-w/worker/types";
import {
  PLESK_API_LOGIN,
  PLESK_API_PASSWORD,
} from "@/lib/server/apis/plesk-xml/config";
import type {
  GetDnsRecordsResult,
  GetSubscriptionResult,
} from "@/lib/server/apis/plesk-xml/types";
import axios, { type AxiosError } from "axios";
import { format } from "date-fns";
import { XMLParser } from "fast-xml-parser";
import type { DeepPartial } from "react-hook-form";
import { create } from "xmlbuilder2";
import certificatesApi from "../certificates";
import { PLESK_API_KEY, PLESK_XML_API_URL } from "./config";
import type {
  AddMailNamePayload,
  GetMailNamesResult,
  MailName,
  PleskApiError,
  PleskPacket,
} from "./types";
import { cache } from "react";

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
): Promise<TResponsePayload | undefined> {
  const xmlRequest = create({ version: "1.0", encoding: "UTF-8" })
    .ele("packet")
    .ele(options.operator)
    .ele(options.operation)
    .ele(options.params)
    .up()
    .up()
    .up()
    .end({ prettyPrint: true });

  try {
    const response = await axios.post(PLESK_XML_API_URL, xmlRequest, {
      headers: {
        "Content-Type": "text/xml",
        HTTP_AUTH_LOGIN: PLESK_API_LOGIN,
        HTTP_AUTH_PASSWD: PLESK_API_PASSWORD,
        KEY: PLESK_API_KEY,
      },
    });

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
      "system" in parsedResponse.packet
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

    const a = cache(() => true)

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
  if (response?.mailname) {
    return Array.isArray(response.mailname)
      ? response.mailname
      : [response.mailname];
  }
  return [];
}

export async function setSiteProperties(
  domainName: string,
  params: DeepPartial<AddWebspaceParams>
) {
  return await requestPleskApi({
    operator: "site",
    operation: "set",
    params: {
      filter: {
        name: domainName,
      },
      values: params,
    },
  });
}

export async function setSiteCertificate(domainName: string, certName: string) {
  return await setSiteProperties(domainName, {
    hosting: {
      vrt_hst: {
        property: [
          {
            name: "certificate_name",
            value: certName,
          },
          {
            name: "ssl",
            value: "true",
          },
        ],
      },
    },
  });
}

export async function* installCertificate(domainName: string) {
  const { certificate, csr, privateKey, ca, keyAuthorization } =
    await certificatesApi.getCertificate(domainName);

  yield keyAuthorization;

  yield 1;

  const certName = domainName.concat(format(new Date(), "dLy"));

  await requestPleskApi<void>({
    operator: "certificate",
    operation: "install",
    params: {
      name: certName,
      webspace: domainName,
      content: {
        csr,
        pvt: privateKey,
        cert: certificate,
        ca,
      },
    },
  });

  await setSiteCertificate(domainName, certName);

  yield 2;

  return;
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

  if (!response?.id) {
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

export async function getPermissionDescriptor() {
  return await requestPleskApi({
    operator: "webspace",
    operation: "get-permission-descriptor",
    params: {
      filter: {
        name: "lucasgarrafielo.xyz",
      },
    },
  });
}

export async function getHostingDescriptor() {
  return await requestPleskApi({
    operator: "webspace",
    operation: "get-physical-hosting-descriptor",
    params: {
      filter: {
        name: "lucasgarrafielo.xyz",
      },
    },
  });
}

export async function getLimitsDescriptor() {
  return await requestPleskApi({
    operator: "webspace",
    operation: "get-limit-descriptor",
    params: {
      filter: {
        name: "lucasgarrafielo.xyz",
      },
    },
  });
}

export async function createSubscription(params: AddWebspaceParams) {
  return await requestPleskApi<{
    status: string;
    id: number;
    guid: string;
  }>({
    operator: "webspace",
    operation: "add",
    params,
  });
}

export async function createDomain(domainName: string) {
  return await requestPleskApi({
    operator: "site",
    operation: "add",
    params: {
      gen_setup: {
        name: domainName,
        "webspace-name": domainName,
      },
    },
  });
}

export async function deleteDomain(domainName: string) {
  return await requestPleskApi({
    operator: "site",
    operation: "del",
    params: {
      filter: {
        name: domainName,
      },
    },
  });
}

export async function getDomain(domainName: string) {
  return await requestPleskApi<{ id: number }>({
    operator: "site",
    operation: "get",
    params: {
      filter: {
        name: domainName,
      },
      dataset: {
        gen_info: {},
        hosting: {},
        disk_usage: {},
        performance: {},
      },
    },
  });
}

export async function getDnsRecords(siteId: number) {
  return await requestPleskApi<GetDnsRecordsResult[]>({
    operator: "dns",
    operation: "get_rec",
    params: {
      filter: {
        "site-id": siteId,
      },
    },
  });
}

export async function getSubscription(domainName: string) {
  return await requestPleskApi<GetSubscriptionResult>({
    operator: "webspace",
    operation: "get",
    params: {
      filter: {
        name: domainName,
      },
      dataset: {
        gen_info: {},
        hosting: {},
        // "hosting-basic": {},
        // limits: {},
        stat: {},
        // prefs: {},
        disk_usage: {},
        performance: {},
        subscriptions: {},
        // permissions: {},
        // "plan-items": {},
        // "php-settings": {},
        "resource-usage": {},
        // mail: {},
        // "aps-filter": {},
        // packages: {}
      },
    },
  });
}

export async function deleteSubscription(domainName: number) {
  return await requestPleskApi({
    operator: "webspace",
    operation: "del",
    params: {
      filter: {
        name: domainName,
      },
    },
  });
}

export async function installCertificateHttp(domainName: string) {
  try {
    const certificateData =
      await certificatesApi.getCertificateHttp(domainName);

    // Install the certificate in Plesk
    const certName = `${domainName}-${Date.now()}`;

    // Create certificate in Plesk
    await createCertificate({
      name: certName,
      certificate: certificateData.certificate,
      privateKey: certificateData.privateKey,
      ca: certificateData.ca,
    });

    // Assign certificate to the domain
    await setSiteCertificate(domainName, certName);

    return certificateData;
  } catch (error) {
    console.error(
      `Error installing HTTP certificate for ${domainName}:`,
      error
    );
    throw error;
  }
}

export async function createCertificate(params: {
  name: string;
  certificate: string;
  privateKey: string;
  ca?: string;
}) {
  return await requestPleskApi({
    operator: "certificate",
    operation: "install",
    params: {
      name: params.name,
      content: {
        csr: "",
        pvt: params.privateKey,
        cert: params.certificate,
        ca: params.ca || "",
      },
    },
  });
}

export async function deleteFtpUser(ftpLogin: string) {
  return await requestPleskApi({
    operator: "ftp-user",
    operation: "del",
    params: {
      filter: {
        name: ftpLogin,
      },
    },
  });
}
