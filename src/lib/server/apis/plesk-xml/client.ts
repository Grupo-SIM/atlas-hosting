<<<<<<< HEAD
import type { AddWebspaceParams } from "@/app/api/wp-install-w/worker/types";
=======
>>>>>>> main
import {
  PLESK_API_LOGIN,
  PLESK_API_PASSWORD,
} from "@/lib/server/apis/plesk-xml/config";
<<<<<<< HEAD
import type {
  ChangeMailSettingsPayload,
  CreateMailPayload,
  EnableMailServicePayload,
  DiskUsageStats,
  GetDnsRecordsResult,
  GetWebspaceDiskUsageResult,
  GetSetMailPrefsPayload,
  GetSubscriptionResult,
} from "@/lib/server/apis/plesk-xml/types";
import axios, { type AxiosError } from "axios";
import { format } from "date-fns";
import { XMLParser } from "fast-xml-parser";
import type { DeepPartial } from "react-hook-form";
import { create } from "xmlbuilder2";
import certificatesApi from "../certificates";
=======
import axios, { type AxiosError } from "axios";
import { XMLParser } from "fast-xml-parser";
import { create } from "xmlbuilder2";
>>>>>>> main
import { PLESK_API_KEY, PLESK_XML_API_URL } from "./config";
import type {
  AddMailNamePayload,
  GetMailNamesResult,
  MailName,
  PleskApiError,
  PleskPacket,
} from "./types";
<<<<<<< HEAD
import { cache } from "react";
=======
import { format } from "date-fns";
import certificatesApi from "../certificates";
import pleskApi from "../plesk";

const axiosInstance = axios.create({
  adapter: "xhr",
});
>>>>>>> main

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
<<<<<<< HEAD
): Promise<TResponsePayload | undefined> {
=======
): Promise<TResponsePayload> {
>>>>>>> main
  const xmlRequest = create({ version: "1.0", encoding: "UTF-8" })
    .ele("packet")
    .ele(options.operator)
    .ele(options.operation)
    .ele(options.params)
    .up()
    .up()
    .up()
    .end({ prettyPrint: true });

<<<<<<< HEAD
=======
  console.log("Plesk API Request XML being sent:", xmlRequest); // Log the generated XML

>>>>>>> main
  try {
    const response = await axios.post(PLESK_XML_API_URL, xmlRequest, {
      headers: {
        "Content-Type": "text/xml",
        HTTP_AUTH_LOGIN: PLESK_API_LOGIN,
        HTTP_AUTH_PASSWD: PLESK_API_PASSWORD,
        KEY: PLESK_API_KEY,
      },
    });

<<<<<<< HEAD
=======
    console.log(response.data);

>>>>>>> main
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
<<<<<<< HEAD
=======
      throw new Error(
        `Plesk API Operation Error ${error.errcode}: ${error.errtext}`
      );
>>>>>>> main
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
<<<<<<< HEAD
=======
    throw error; // Re-throw other errors (like parsing or Plesk API errors)
>>>>>>> main
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
<<<<<<< HEAD
  if (response?.mailname) {
=======
  if (response.mailname) {
>>>>>>> main
    return Array.isArray(response.mailname)
      ? response.mailname
      : [response.mailname];
  }
  return [];
}

<<<<<<< HEAD
export async function setSiteProperties(
  domainName: string,
  params: DeepPartial<AddWebspaceParams>
) {
=======
export async function setSiteCertificate(domainName: string, certName: string) {
>>>>>>> main
  return await requestPleskApi({
    operator: "site",
    operation: "set",
    params: {
      filter: {
        name: domainName,
      },
<<<<<<< HEAD
      values: params,
    },
  });
}

export const getDomainDiskUsage = cache(
  async (domainName: string): Promise<DiskUsageStats | undefined> => {
    if (!domainName) {
      console.error(
        "Invalid domainName passed to getDomainDiskUsage:",
        domainName
      );
      // It's better to throw an error for invalid input to prevent silent failures.
      throw new Error("Invalid domainName provided for fetching disk usage.");
    }

    const response = await requestPleskApi<GetWebspaceDiskUsageResult>({
      operator: "webspace",
      operation: "get",
      params: {
        filter: { name: domainName },
        dataset: { disk_usage: {} }, // Specifically request only disk_usage
      },
    });

    if (response?.status === "ok" && response.data?.disk_usage) {
      return response.data.disk_usage;
    }
    if (response?.status === "error") {
      console.error(
        `Error fetching disk usage for ${domainName}: Plesk API Error ${response.errcode} - ${response.errtext}`
      );
    }
    // Return undefined if not successful or data is not in the expected shape
    return undefined;
  }
);

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

=======
      values: {
        hosting: {
          vrt_hst: {
            property: {
              name: "certificate_name",
              value: certName,
            },
          },
        },
      },
    },
  })
}

export async function* installCertificate(domainName: string) {
  const { certificate, csr, privateKey, ca } =
    await certificatesApi.getCertificate(domainName);

>>>>>>> main
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

<<<<<<< HEAD
export async function activateMailForSite(siteId: number) {
  // const payload: ChangeMailSettingsPayload = {
  //   filter: { "site-id": siteId },
  //   prefs: {
  //     mailservice: true, // Enable mail service
  //     webmail: true, // Enable webmail access
  //   },
  // };

  // const response = await requestPleskApi<{ status: string }>({
  //   operator: "mail",
  //   operation: "set_prefs",
  //   params: payload,
  // });

  // if (response?.status !== "ok") {
  //   throw new Error("Failed to activate mail service for the site.");
  // }

  // return response;

  const payload: EnableMailServicePayload = {
    "site-id": siteId,
  };

  const response = await requestPleskApi<{ status: string }>({
    operator: "mail",
    operation: "enable",
    params: payload,
  });

  if (response?.status !== "ok") {
    throw new Error("Failed to activate mail service for the site.");
  }
}

export async function createMailAccount(
  siteId: number,
  mailAccountData: CreateMailPayload["filter"]["mailname"]
): Promise<{ id: number }> {
  const payload: CreateMailPayload = {
    filter: {
      "site-id": siteId,
      mailname: mailAccountData,
    },
  };

  const response = await requestPleskApi<{ mailname: { id: number } }>({
    operator: "mail",
    operation: "create",
    params: payload,
  });

  console.log(response);

  if (!response?.mailname?.id) {
    throw new Error("Failed to create mail account: No ID returned.");
  }

  return { id: response.mailname.id }; // Assuming 'id' is returned on successful creation
=======
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
>>>>>>> main
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

<<<<<<< HEAD
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
  return requestPleskApi({
    operator: "ftp-user",
    operation: "del",
    params: {
      filter: {
        name: ftpLogin,
      },
    },
  });
}
=======
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
>>>>>>> main
