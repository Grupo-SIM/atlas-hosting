import { DeSECClient } from "./DeSECClient";
import { AuthService } from "./AuthService";
import { TokenService } from "./TokenService";
import { DomainService } from "./DomainService";
import { RRsetService } from "./RRsetService";
import { DynDNSService } from "./DynDNSService";

export * from "./types";
export * from "./errors";

/**
 * The main deSEC API wrapper class.
 * Provides access to all deSEC API services.
 */
export class DeSECWrapper {
  private client: DeSECClient;

  public auth: AuthService;
  public tokens: TokenService;
  public domains: DomainService;
  public rrsets: RRsetService;
  public dyndns: DynDNSService;

  /**
   * Creates an instance of the DeSECWrapper.
   * @param initialToken Optional: An initial authentication token to use.
   */
  constructor(initialToken?: string) {
    this.client = new DeSECClient(initialToken);

    this.auth = new AuthService(this.client);
    this.tokens = new TokenService(this.client);
    this.domains = new DomainService(this.client);
    this.rrsets = new RRsetService(this.client);
    this.dyndns = new DynDNSService(this.client);
  }

  /**
   * Sets the authentication token for all subsequent API calls.
   * @param token The deSEC API token secret.
   */
  public setToken(token: string): void {
    this.client.setToken(token);
  }

  /**
   * Clears the authentication token, effectively logging out the client.
   */
  public clearToken(): void {
    this.client.clearToken();
  }
}

// Example Usage (for demonstration, not part of the library itself)
/*
async function main() {
  const desec = new DeSECWrapper();

  try {
    // 1. Get a captcha for registration
    const captcha = await desec.auth.getCaptcha();
    console.log('Captcha ID:', captcha.id);
    // console.log('Captcha Image (base64):', captcha.challenge); // You'd typically display this to a user

    // 2. (Manual step: Solve captcha and get solution)
    const captchaSolution = 'YOUR_CAPTCHA_SOLUTION'; // Replace with actual solution

    // 3. Register an account (this will send a verification email)
    // await desec.auth.registerAccount({
    //   email: 'test@example.com',
    //   password: 'StrongPassword123!',
    //   captcha: { id: captcha.id, solution: captchaSolution },
    //   domain: 'mytestdomain.dedyn.io' // Optional: create domain on registration
    // });
    // console.log('Account registration initiated. Check email for verification link.');

    // 4. Login to get a token (assuming email is verified)
    // const loginResponse = await desec.auth.login({
    //   email: 'your_email@example.com',
    //   password: 'YourAccountPassword'
    // });
    // console.log('Logged in. Token ID:', loginResponse.id);
    // desec.setToken(loginResponse.token); // Set the obtained token for subsequent requests

    // 5. Get account info
    // const accountInfo = await desec.auth.getAccountInfo();
    // console.log('Account Email:', accountInfo.email);
    // console.log('Domains under management:', accountInfo.domains_under_management);

    // 6. Create a new API token with specific permissions
    // const newToken = await desec.tokens.createToken({
    //   name: 'my-automation-token',
    //   perm_create_domain: true,
    //   perm_delete_domain: true,
    //   max_age: 'P365D' // Valid for 365 days
    // });
    // console.log('New API Token created. Secret (SAVE THIS!):', newToken.token);
    // console.log('New Token ID:', newToken.id);

    // 7. List domains
    // const domains = await desec.domains.listDomains();
    // console.log('Your domains:', domains.map(d => d.name));

    // 8. Create a new domain
    // const newDomain = await desec.domains.createDomain({ name: 'my-new-domain.dedyn.io' });
    // console.log('Created new domain:', newDomain.name);

    // 9. Create an A record for the new domain
    // const rrset = await desec.rrsets.createRRset('my-new-domain.dedyn.io', {
    //   subname: 'www',
    //   type: 'A',
    //   ttl: 3600,
    //   records: ['192.0.2.1']
    // });
    // console.log('Created RRset:', rrset);

    // 10. Update an A record (change IP)
    // await desec.rrsets.modifyRRset('my-new-domain.dedyn.io', 'www', 'A', {
    //   records: ['192.0.2.2']
    // });
    // console.log('Updated RRset for www.my-new-domain.dedyn.io');

    // 11. Perform a DynDNS update (using a token specifically for DynDNS)
    // const dynDNSToken = 'YOUR_DYNDNS_TOKEN_SECRET'; // Use a token with DynDNS permissions
    // const dynDNSDomain = 'your-dyndns-domain.dedyn.io';
    // const updateResult = await desec.dyndns.updateIP(dynDNSDomain, dynDNSToken, '198.51.100.1');
    // console.log(`DynDNS update result for ${dynDNSDomain}: ${updateResult}`);

    // 12. Delete an RRset
    // await desec.rrsets.deleteRRset('my-new-domain.dedyn.io', 'www', 'A');
    // console.log('Deleted RRset for www.my-new-domain.dedyn.io');

    // 13. Delete the domain
    // await desec.domains.deleteDomain('my-new-domain.dedyn.io');
    // console.log('Deleted domain: my-new-domain.dedyn.io');

  } catch (error) {
    if (error instanceof DeSECRateLimitError) {
      console.error(`Rate Limit Error: ${error.message} (Retry after ${error.retryAfter}s)`);
    } else if (error instanceof DeSECError) {
      console.error(`DeSEC API Error: ${error.message} (Status: ${error.statusCode})`, error.responseBody);
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}

// main();
*/

const desecApi = new DeSECWrapper();
desecApi.setToken(process.env.DESEC_API_KEY!);

export default desecApi;
