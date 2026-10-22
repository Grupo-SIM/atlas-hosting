import type { CliCallResponse } from "@/plesk";
import type { PleskCliOutput } from "./types";

export function transformPleskHostToNamecheapHostName(
  pleskHost: string,
  domainName: string
): string {
  const normalizedDomain = domainName.toLowerCase();
  let host = pleskHost.toLowerCase();

  const fullDomainPattern1 = `.${normalizedDomain}.`;
  const fullDomainPattern2 = `.${normalizedDomain}`;
  const apexPattern1 = `${normalizedDomain}.`; // e.g., example.com.
  const apexPattern2 = `${normalizedDomain}`; // e.g., example.com

  if (host.endsWith(fullDomainPattern1)) {
    host = host.substring(0, host.length - fullDomainPattern1.length);
  } else if (host.endsWith(fullDomainPattern2) && host !== fullDomainPattern2) {
    // ensure it's not just ".example.com"
    host = host.substring(0, host.length - fullDomainPattern2.length);
  } else if (host === apexPattern1 || host === apexPattern2) {
    host = "@";
  } else {
    // Fallback for other subdomain patterns, remove trailing domain part
    const domainToTrim = `.${normalizedDomain}`;
    if (host.endsWith(domainToTrim)) {
      host = host.substring(0, host.length - domainToTrim.length);
    }
  }

  // Remove any remaining trailing dot from the host part
  if (host.endsWith(".") && host !== "@") {
    host = host.substring(0, host.length - 1);
  }

  return host === "" ? "@" : host; // if host became empty, it's apex.
}

export function parsePleskCliResponse(
  response: CliCallResponse
): PleskCliOutput {
  let parsedOutput: PleskCliOutput = {
    exit_code:
      response.code === 200 && !response.stderr ? 0 : response.code || -1,
    stderr: response.stderr || "",
  };
  try {
    if (response.stdout) {
      const jsonOutput = JSON.parse(response.stdout);
      parsedOutput = {
        ...parsedOutput,
        ...jsonOutput,
        stdout: response.stdout, // Keep raw stdout as well
      };
      // Try to get specific fields if they exist
      if (jsonOutput.result && typeof jsonOutput.result === "object") {
        parsedOutput.admin_url =
          jsonOutput.result.admin_url || parsedOutput.admin_url;
        parsedOutput.site_url =
          jsonOutput.result.site_url || parsedOutput.site_url;
      }
      parsedOutput.admin_url = jsonOutput.admin_url || parsedOutput.admin_url; // From top level
      parsedOutput.site_url = jsonOutput.site_url || parsedOutput.site_url; // From top level
      if (typeof jsonOutput.exit_code === "number") {
        // CLI might put exit_code in JSON
        parsedOutput.exit_code = jsonOutput.exit_code;
      }
    } else {
      parsedOutput.stdout = "";
    }
  } catch (e) {
    // console.warn("Failed to parse Plesk CLI stdout as JSON:", response.stdout);
    parsedOutput.stdout = response.stdout || ""; // Store non-JSON stdout
    if (!parsedOutput.message && !parsedOutput.error && response.stderr) {
      parsedOutput.error = response.stderr;
    } else if (!parsedOutput.message && !parsedOutput.error) {
      // parsedOutput.error = `Invalid or non-JSON response from server: ${response.stdout}`;
    }
  }
  return parsedOutput;
}

// Helper function to send SSE messages
export function* sendSSE(
  type: "INFO" | "ERROR" | "SUCCESS" | "STEP",
  message: string,
  details?: unknown
) {
  const payload = { details, message, step: message, type };
  console.log({ payload });
  const data = JSON.stringify(payload);
  yield `data: ${data}\n\n`;
}

export function getSSEPayload(
  type: "INFO" | "ERROR" | "SUCCESS" | "STEP",
  message: string,
  details?: unknown
) {
  const payload = { details, message, step: message, type };
  const data = JSON.stringify(payload);
  return `data: ${data}\n\n`;
}
