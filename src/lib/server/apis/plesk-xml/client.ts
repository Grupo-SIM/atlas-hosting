import {
  PLESK_API_LOGIN,
  PLESK_API_PASSWORD,
  PLESK_API_KEY,
  PLESK_XML_API_URL,
} from "@/lib/server/apis/plesk-xml/config";
import type { AddWebspaceParams } from "@/app/api/wp-install-w/worker/types";
import type {
  ChangeMailSettingsPayload,
  CreateMailPayload,
  EnableMailServicePayload,
  DiskUsageStats,
  GetDnsRecordsResult,
  GetWebspaceDiskUsageResult,
  GetSetMailPrefsPayload,
  GetSubscriptionResult,
  MailName,
  PleskApiError,
  PleskPacket,
  GetMailNamesResult,
} from "@/lib/server/apis/plesk-xml/types";
import axios, { type AxiosError } from "axios";
import { format } from "date-fns";
import { XMLParser } from "fast-xml-parser";
import type { DeepPartial } from "react-hook-form";
import { create } from "xmlbuilder2";
import certificatesApi from "../certificates";
import { cache } from "react";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: true,
  isArray: (tagName, jPath) => {
    if (jPath === "packet.mail.get_info.result.mailname") return true;
    return false;
  },
});

interface PleskRequestOptions {
  operator: string;
  operation: string;
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
      const error = result as PleskApiError;
      console.error("Plesk API Operation Error:", error);
    }

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
    throw error;
  }
}

export async function getMailAccounts(pleskId: number): Promise<MailName[]> {
  if (typeof pleskId !== "number" || Number.isNaN(pleskId)) {
    throw new Error("Invalid pleskId provided for fetching mail accounts.");
  }

  const response = await requestPleskApi<GetMailNamesResult>({
    operator: "mail",
    operation: "get_info",
    params: {
      filter: { "site-id": pleskId },
      mailbox: {},
      "mailbox-usage": {},
      forwarding: {},
      autoresponder: {},
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

export const getDomainDiskUsage = cache(
  async (domainName: string): Promise<DiskUsageStats | undefined> => {
    if (!domainName) {
      throw new Error("Invalid domainName provided for fetching disk usage.");
    }

    const response = await requestPleskApi<GetWebspaceDiskUsageResult>({
      operator: "webspace",
      operation: "get",
      params: {
        filter: { name: domainName },
        dataset: { disk_usage: {} },
      },
    });

    if (response?.status === "ok" && response.data?.disk_usage) {
      return response.data.disk_usage;
    }
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

export async function activateMailForSite(siteId: number) {
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

  if (!response?.mailname?.id) {
    throw new Error("Failed to create mail account: No ID returned.");
  }

  return { id: response.mailname.id };
}

export async function deleteMailAccount(mailNameId: number): Promise<void> {
  await requestPleskApi<void>({
    operator: "mail",
    operation: "remove_mail_name",
    params: {
      filter: { mn_id: mailNameId },
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
        stat: {},
        disk_usage: {},
        performance: {},
        subscriptions: {},
        "resource-usage": {},
      },
    },
  });
}

export async function deleteSubscription(domainName: string) {
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

    const certName = `${domainName}-${Date.now()}`;

    await createCertificate({
      name: certName,
      certificate: certificateData.certificate,
      privateKey: certificateData.privateKey,
      ca: certificateData.ca,
    });

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
