import type { DeSECClient } from "./DeSECClient";
import type {
  AccountInfo,
  CaptchaResponse,
  ChangeEmailPayload,
  DeleteAccountPayload,
  LoginPayload,
  LoginResponse,
  RegisterAccountPayload,
  RequestPasswordResetPayload,
} from "./types";

/**
 * Service for managing deSEC user accounts.
 */
export class AuthService {
  private client: DeSECClient;

  constructor(client: DeSECClient) {
    this.client = client;
  }

  /**
   * Obtains a captcha challenge.
   * @returns A CaptchaResponse object containing the captcha ID and base64-encoded image.
   * [1]
   */
  public async getCaptcha(): Promise<CaptchaResponse> {
    return this.client.post<CaptchaResponse>("/captcha/");
  }

  /**
   * Registers a new user account.
   * Note: This initiates the process; account activation requires email verification.
   * [1]
   * @param payload The registration details including email, password, and captcha.
   * @returns A Promise that resolves on successful initiation (202 Accepted).
   */
  public async registerAccount(payload: RegisterAccountPayload): Promise<void> {
    await this.client.post<void>("/auth/", payload);
  }

  /**
   * Logs in a user and obtains an authentication token.
   * [1]
   * @param payload The login credentials (email and password).
   * @returns A LoginResponse object containing the token secret and other token details.
   */
  public async login(payload: LoginPayload): Promise<LoginResponse> {
    return this.client.post<LoginResponse>("/auth/login/", payload);
  }

  /**
   * Retrieves information about the authenticated user's account.
   * [1]
   * @returns An AccountInfo object.
   */
  public async getAccountInfo(): Promise<AccountInfo> {
    return this.client.get<AccountInfo>("/auth/account/");
  }

  /**
   * Modifies existing user account settings.
   * Currently, only `outreach_preference` can be modified via PATCH.
   * [1]
   * @param outreachPreference Boolean indicating preference for development announcements.
   * @returns The updated AccountInfo object.
   */
  public async modifyAccountSettings(
    outreachPreference: boolean
  ): Promise<AccountInfo> {
    return this.client.patch<AccountInfo>("/auth/account/", {
      outreach_preference: outreachPreference,
    });
  }

  /**
   * Initiates a password reset for the account.
   * Note: This sends a reset link to the user's email; actual reset is a separate step.
   * [1]
   * @param payload The email and captcha solution.
   * @returns A Promise that resolves on successful initiation (202 Accepted).
   */
  public async requestPasswordReset(
    payload: RequestPasswordResetPayload
  ): Promise<void> {
    await this.client.post<void>("/auth/account/reset-password/", payload);
  }

  /**
   * Initiates an email address change for the account.
   * Note: This sends a verification link to the new email; actual change is a separate step.
   * [1]
   * @param payload The current email, password, and new email address.
   * @returns A Promise that resolves on successful initiation (202 Accepted).
   */
  public async requestEmailChange(payload: ChangeEmailPayload): Promise<void> {
    await this.client.post<void>("/auth/account/change-email/", payload);
  }

  /**
   * Initiates the account deletion process.
   * Note: All domains must be deleted first. A confirmation email is sent.
   * [1]
   * @param payload The email and password for confirmation.
   * @returns A Promise that resolves on successful initiation (202 Accepted).
   */
  public async requestAccountDeletion(
    payload: DeleteAccountPayload
  ): Promise<void> {
    await this.client.post<void>("/auth/account/delete/", payload);
  }

  /**
   * Logs out the current session by invalidating the authentication token used for the request.
   * [1]
   * @returns A Promise that resolves on successful logout.
   */
  public async logout(): Promise<void> {
    await this.client.post<void>("/auth/logout/");
    this.client.clearToken(); // Clear the token from the client after logout
  }

  /**
   * Confirms account activation using the code from the email verification link.
   * This is typically done by the user clicking a link, but can be automated if the code is extracted.
   * [1]
   * @param code The activation code from the email link.
   * @returns A Promise that resolves on successful activation.
   */
  public async confirmAccountActivation(code: string): Promise<void> {
    await this.client.post<void>(`/v/activate-account/${code}/`);
  }

  /**
   * Confirms password reset using the code from the email reset link and provides a new password.
   * This is typically done by the user clicking a link, but can be automated if the code is extracted.
   * [1]
   * @param code The reset code from the email link.
   * @param newPassword The new password to set.
   * @returns A Promise that resolves on successful password reset.
   */
  public async confirmPasswordReset(
    code: string,
    newPassword: string
  ): Promise<void> {
    await this.client.post<void>(`/v/reset-password/${code}/`, {
      new_password: newPassword,
    });
  }

  /**
   * Confirms email address change using the code from the email verification link.
   * This is typically done by the user clicking a link, but can be automated if the code is extracted.
   * [1]
   * @param code The change email code from the email link.
   * @returns A Promise that resolves on successful email change.
   */
  public async confirmEmailChange(code: string): Promise<void> {
    await this.client.post<void>(`/v/change-email/${code}/`);
  }

  /**
   * Confirms account deletion using the code from the email confirmation link.
   * This is typically done by the user clicking a link, but can be automated if the code is extracted.
   * [1]
   * @param code The deletion code from the email link.
   * @returns A Promise that resolves on successful account deletion.
   */
  public async confirmAccountDeletion(code: string): Promise<void> {
    await this.client.post<void>(`/v/delete-account/${code}/`);
  }
}
