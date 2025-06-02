import acme from "acme-client";
import dns from "node:dns/promises";
import namecheapApi from "../namecheap";
import type { DnsHostRecord, DnsRecordType } from "../namecheap/types";
import { lookupTxt } from "dns-query";

export class CertificatesApi {
  private readonly letsEncryptDirectoryUrl =
    acme.directory.letsencrypt.production;
  private readonly certEmail = "lucasgarrafielo@gmail.com";

  public async getCertificate(domainName: string) {
    const sld = domainName.split(".")[0];
    const tld = domainName.split(".")[1];

    const currentDnsRecords = await namecheapApi
      .getDnsHosts({
        SLD: sld,
        TLD: tld,
      })
      .then(({ Hosts }) =>
        Hosts.filter(
          ({ Type, Address }) => Type !== "TXT" || Address === "_acme-challenge"
        ).map((host) => ({
          HostName: host.Name,
          RecordType: host.Type as DnsRecordType,
          Address: host.Address,
        })).filter(predicate => predicate.HostName !== "_acme-challenge" || predicate.RecordType !== "TXT")
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
        const keyAuthorization =
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

        // // --- 3b. Wait for DNS Propagation ---
        // // Implement a loop with a delay to check if the TXT record is visible publicly.
        // // Use a DNS lookup tool (e.g., 'dns' module in Node, or an external API)
        // // This is crucial as Let's Encrypt needs to see it.
        // await Promise.all([
        //   this.checkDnsPropagation(
        //     `_acme-challenge.${domainName}`,
        //     keyAuthorization
        //   ),
        // ]); // You'll need to implement this

        await Bun.sleep(15000);

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
}

const certificatesApi = new CertificatesApi();

export default certificatesApi;
