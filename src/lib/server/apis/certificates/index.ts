import acme from "acme-client";
import { Client as FtpClient } from "basic-ftp";
import { lookupTxt } from "dns-query";
import { access, rmdir, unlink } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import namecheapApi from "../namecheap";
import type { DnsHostRecord, DnsRecordType } from "../namecheap/types";
import { getSubscription } from "../plesk-xml/client";
import { mkdir } from "node:fs/promises";

export class CertificatesApi {
  private readonly letsEncryptDirectoryUrl =
    acme.directory.letsencrypt.production;
  private readonly certEmail = "lucasgarrafielo04@gmail.com";
  private readonly challengeDirectory = ".well-known/acme-challenge"; // Change this to your desired directory

  public async getCertificate(domainName: string) {
    const sld = domainName.split(".")[0];
    const tld = domainName.split(".")[1];
    let keyAuthorization = "";

    const currentDnsRecords = await namecheapApi
      .getDnsHosts({
        SLD: sld,
        TLD: tld,
      })
      .then(({ Hosts }) =>
        Hosts.filter(
          ({ Type, Address }) => Type !== "TXT" || Address === "_acme-challenge"
        )
          .map((host) => ({
            HostName: host.Name,
            RecordType: host.Type as DnsRecordType,
            Address: host.Address,
          }))
          .filter(
            (predicate) =>
              predicate.HostName !== "_acme-challenge" ||
              predicate.RecordType !== "TXT"
          )
      );
    try {
      // --- 1. Initialize ACME Client & Account ---
      console.log("Initializing ACME client...");
      const accountKey = await acme.crypto.createPrivateKey();
      const client = new acme.Client({
        directoryUrl: this.letsEncryptDirectoryUrl,
        accountKey: accountKey,
      });

      console.log("Creating/retrieving Let's Encrypt account...");

      await client.createAccount({
        termsOfServiceAgreed: true,
        contact: [`mailto:${this.certEmail}`],
      });

      console.log("Account created/retrieved successfully.");

      // --- 2. Create Certificate Order ---
      console.log(`Creating certificate order for: ${domainName}`);
      const order = await client.createOrder({
        identifiers: [
          {
            type: "dns",
            value: domainName,
          },
          {
            type: "dns",
            value: `*.${domainName}`,
          },
        ],
      });
      console.log("Order created successfully.");

      // --- 3. Get Authorizations & Handle DNS Challenges ---
      const authorizations = await client.getAuthorizations(order);
      console.log(`Retrieved ${authorizations.length} authorization(s).`);

      for (const authz of authorizations) {
        const dnsChallenge = authz.challenges.find(
          (challenge) => challenge.type === "dns-01"
        );

        if (!dnsChallenge) {
          throw new Error(
            `DNS-01 challenge not found for authorization: ${authz.identifier.value}`
          );
        }

        const challengeDomain = `_acme-challenge.${authz.identifier.value}`;
        keyAuthorization =
          await client.getChallengeKeyAuthorization(dnsChallenge);

        console.log("Attempting to create TXT record:");
        console.log(`  Domain: ${challengeDomain}`);
        console.log(`  Value: ${keyAuthorization}`);

        const newDnsRecords: DnsHostRecord[] = [
          {
            HostName: "_acme-challenge",
            RecordType: "TXT",
            Address: keyAuthorization,
          },
        ];

        const recordsToSet = currentDnsRecords.concat(newDnsRecords);

        console.log(recordsToSet);

        // --- 3a. Create DNS TXT Record ---
        // This part is highly dependent on your DNS provider's API
        const result = await namecheapApi.setHosts({
          SLD: sld,
          TLD: tld,
          Records: recordsToSet,
        });

        console.log({ result });

        console.log(
          "TXT record creation initiated. Waiting for propagation..."
        );

        await this.checkDnsPropagation(
          `_acme-challenge.${domainName}`,
          keyAuthorization
        );

        await Bun.sleep(3 * 1000);

        await this.checkDnsPropagation(
          `_acme-challenge.${domainName}`,
          keyAuthorization
        );

        console.log("DNS record propagated.");

        // --- 3c. Notify Let's Encrypt to Verify Challenge ---
        console.log("Notifying Let's Encrypt to verify challenge...");
        let done = false;
        while (!done) {
          try {
            await client.completeChallenge(dnsChallenge);
            done = true;
          } catch (error) {
            console.error("Error completing challenge:", error);
            await Bun.sleep(5000);
          }
        }

        done = false;

        // --- 3d. Wait for Challenge Validation ---
        console.log("Waiting for challenge validation...");
        while (!done) {
          try {
            await client.waitForValidStatus(dnsChallenge); // Or poll authz.status
            done = true;
          } catch (error) {
            console.error("Error waiting for challenge validation:", error);
            await Bun.sleep(5000);
          }
        }
        console.log(
          `Challenge for ${authz.identifier.value} validated successfully.`
        );
      }

      // --- 4. Finalize Order & Get Certificate ---
      console.log("All challenges satisfied. Finalizing order...");
      const [key, csr] = await acme.crypto.createCsr({
        commonName: domainName,
        altNames: [`*.${domainName}`], // if wildcard
      }); // Create a new private key and CSR for the certificate itself

      const result = await client.finalizeOrder(order, csr);

      const certificate = await client.getCertificate(order);

      console.log("Certificate obtained successfully!");
      console.log("--- Certificate ---");
      console.log(certificate); // This is your full certificate chain (PEM format)
      console.log("--- Private Key for Certificate ---");
      console.log(key.toString()); // This is the private key for the certificate (PEM format)

      // Extract CA certificate from the chain
      // The certificate chain contains multiple PEM blocks separated by line breaks
      const pemCertificates = certificate.split(
        /(?=-----BEGIN CERTIFICATE-----)/g
      );

      // The rest are intermediate and root CA certificates
      const caCertificates = pemCertificates.slice(1).join("\n");

      return {
        certificate: certificate,
        privateKey: key.toString(),
        csr: csr.toString(),
        ca: caCertificates.trim(),
        keyAuthorization,
      };
      // TODO: Save the certificate and private key to files securely.
      // e.g., fs.writeFileSync('certificate.pem', certificate);
      // e.g., fs.writeFileSync('privatekey.pem', key.toString());
    } catch (error) {
      console.error("An error occurred:", error);
      throw error;
    }
  }

  private async checkDnsPropagation(
    challengeDomain: string,
    keyAuthorization: string
  ): Promise<void> {
    let done = false;

    const checkInterval = 5000;

    while (!done) {
      try {
        const { entries } = await lookupTxt(challengeDomain, {
          endpoints: ["1.1.1.1", "8.8.8.8"],
        });

        const result = entries.map((entry) => entry.data);

        done = result.includes(keyAuthorization);

        if (done) {
          console.log(
            `DNS record for ${challengeDomain} is now visible: ${result}`
          );
        } else {
          console.log(
            `Waiting for DNS record to propagate... Current entries: ${result}`
          );
        }
      } catch (error) {
        console.error(`Error checking DNS record: ${error}`);
      }

      await Bun.sleep(checkInterval);
    }
  }

  public async getCertificateHttp(domainName: string) {
    console.log(`Starting HTTP certificate generation for: ${domainName}`);

    try {
      // --- 1. Initialize ACME Client & Account ---
      console.log("Initializing ACME client...");
      const accountKey = await acme.crypto.createPrivateKey();
      const client = new acme.Client({
        directoryUrl: this.letsEncryptDirectoryUrl,
        accountKey: accountKey,
      });

      console.log("Creating/retrieving Let's Encrypt account...");
      await client.createAccount({
        termsOfServiceAgreed: true,
        contact: [`mailto:${this.certEmail}`],
      });

      console.log("Account created/retrieved successfully.");

      // --- 2. Create Certificate Order ---
      console.log(`Creating certificate order for: ${domainName}`);
      const order = await client.createOrder({
        identifiers: [
          {
            type: "dns",
            value: domainName,
          },
          {
            type: "dns",
            value: `www.${domainName}`,
          },
        ],
      });
      console.log("Order created successfully.");

      // --- 3. Get Authorizations & Handle HTTP Challenges ---
      const authorizations = await client.getAuthorizations(order);
      console.log(`Retrieved ${authorizations.length} authorization(s).`);

      const challengeFiles: Array<{
        token: string;
        keyAuthorization: string;
        domain: string;
      }> = [];

      for (const authz of authorizations) {
        const domain = authz.identifier.value;
        console.log(`Processing authorization for: ${domain}`);

        // Find HTTP-01 challenge
        const httpChallenge = authz.challenges.find(
          (challenge) => challenge.type === "http-01"
        );

        if (!httpChallenge) {
          throw new Error(`No HTTP-01 challenge found for domain: ${domain}`);
        }

        console.log(`Found HTTP-01 challenge for: ${domain}`);

        // Get challenge details
        const keyAuthorization =
          await client.getChallengeKeyAuthorization(httpChallenge);
        const token = httpChallenge.token;

        // Store challenge file info
        challengeFiles.push({
          token,
          keyAuthorization,
          domain,
        });

        console.log(`Challenge token for ${domain}: ${token}`);
        console.log(
          `Challenge file should be accessible at: http://${domain}/${this.challengeDirectory}/${token}`
        );

        // Create the challenge file on the web server
        await this.createChallengeFile(domainName, token, keyAuthorization);

        // Verify the challenge file is accessible
        await this.verifyChallengeFile(domain, token, keyAuthorization);

        // Complete the challenge
        console.log(`Completing HTTP challenge for: ${domain}`);
        await client.completeChallenge(httpChallenge);

        // Wait for this specific challenge validation
        console.log(`Waiting for challenge validation for: ${domain}`);
        await client.waitForValidStatus(httpChallenge);
        console.log(`Challenge for ${domain} validated successfully.`);
      }

      console.log("All challenges validated successfully.");

      // --- 5. Clean up challenge files ---
      for (const challenge of challengeFiles) {
        await this.cleanupChallengeFile(domainName, challenge.token);
      }

      // --- 6. Finalize Order & Get Certificate ---
      console.log("All challenges satisfied. Finalizing order...");
      const [key, csr] = await acme.crypto.createCsr({
        commonName: domainName,
        altNames: [`www.${domainName}`],
      });

      await client.finalizeOrder(order, csr);
      const certificate = await client.getCertificate(order);

      console.log("Certificate obtained successfully!");
      console.log("--- Certificate ---");
      console.log(certificate);
      console.log("--- Private Key for Certificate ---");
      console.log(key.toString());

      // Extract CA certificate from the chain
      const pemCertificates = certificate.split(
        /(?=-----BEGIN CERTIFICATE-----)/g
      );
      const caCertificates = pemCertificates.slice(1).join("\n");

      return {
        certificate: certificate,
        privateKey: key.toString(),
        csr: csr.toString(),
        ca: caCertificates.trim(),
      };
    } catch (error) {
      console.error(
        "An error occurred during HTTP certificate generation:",
        error
      );

      // Clean up any challenge files in case of error
      try {
        const challengeDir = `/var/www/${domainName}/.well-known/acme-challenge`;
        if (
          await (async () => {
            try {
              await access(challengeDir);
            } catch {
              await mkdir(challengeDir, { recursive: true });
            }

            await access(challengeDir);
            return true;
          })()
        ) {
          await rmdir(challengeDir, { recursive: true });
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }

      throw error;
    }
  }

  private async createChallengeFile(
    domainName: string,
    token: string,
    keyAuthorization: string
  ): Promise<void> {
    const ftpClient = new FtpClient();

    const subscriptionResult = await getSubscription(domainName);
    if (!subscriptionResult?.data) {
      throw new Error(`Could not find subscription data for domain: ${domainName}`);
    }

    const hostingData = Object.fromEntries(
      subscriptionResult.data.hosting.vrt_hst.property.map(({ name, value }: { name: string; value: string | number }) => [name, value])
    );

    const { ftp_login, ftp_password } = hostingData;

    await ftpClient.access({
      host: process.env.SERVER_IP as string,
      user: ftp_login as string,
      password: ftp_password as string,
    });

    const challengeDir = path.join("/httpdocs", this.challengeDirectory);
    const challengeFile = path.join(challengeDir, token);

    const stream = Readable.from(keyAuthorization);
    const htAccessStream = Readable.from(
      `<Directory ".well-known">
    Require all granted
</Directory>`
    );

    try {
      // Ensure the challenge directory exists
      await ftpClient.ensureDir(challengeDir);
      // Create the challenge file with the key authorization
      await ftpClient.uploadFrom(stream, challengeFile);

      await ftpClient.uploadFrom(
        htAccessStream,
        path.join("/httpdocs", ".htaccess")
      );

      console.log(`Challenge file created: ${challengeFile}`);

      ftpClient.close();
    } catch (error) {
      console.error(
        `Failed to create challenge file for ${domainName}:`,
        error
      );
      throw new Error(
        `Unable to create challenge file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private async verifyChallengeFile(
    domain: string,
    token: string,
    expectedContent: string
  ): Promise<void> {
    const challengeUrl = `http://${domain}/${this.challengeDirectory}/${token}`;
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Verifying challenge file (attempt ${attempt}/${maxRetries}): ${challengeUrl}`
        );

        const response = await fetch(challengeUrl, {
          method: "GET",
          headers: {
            "User-Agent": "ACME-Client/1.0",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();

        if (content.trim() === expectedContent.trim()) {
          console.log(`Challenge file verification successful for: ${domain}`);
          return;
        }

        throw new Error(
          `Content mismatch. Expected: ${expectedContent}, Got: ${content}`
        );
      } catch (error) {
        console.warn(
          `Challenge verification attempt ${attempt} failed:`,
          error
        );

        if (attempt === maxRetries) {
          throw new Error(
            `Challenge file verification failed after ${maxRetries} attempts. Last error: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  private async cleanupChallengeFile(
    domainName: string,
    token: string
  ): Promise<void> {
    const ftpClient = new FtpClient();

    try {
      const subscriptionResult = await getSubscription(domainName);
      if (!subscriptionResult?.data) {
        throw new Error(`Could not find subscription data for domain: ${domainName}`);
      }

      const hostingData = Object.fromEntries(
        subscriptionResult.data.hosting.vrt_hst.property.map(({ name, value }: { name: string; value: string | number }) => [name, value])
      );

      const { ftp_login, ftp_password } = hostingData;

      await ftpClient.access({
        host: process.env.SERVER_IP as string,
        user: ftp_login as string,
        password: ftp_password as string,
      });

      const challengeFile = path.join(
        "/httpdocs",
        this.challengeDirectory,
        token
      );
      await ftpClient.remove(challengeFile);

      console.log(`Challenge file cleaned up: ${challengeFile}`);

      ftpClient.close();
    } catch (error) {
      console.warn(
        `Failed to cleanup challenge file for ${domainName}:`,
        error
      );
      // Don't throw here as cleanup failure shouldn't stop the process
    } finally {
      ftpClient.close();
    }
  }
}

const certificatesApi = new CertificatesApi();

export default certificatesApi;
