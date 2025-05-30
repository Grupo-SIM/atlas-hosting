// src/app/(auth)/email/actions.ts
"use server";

import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgUserEmailAccountConfigs,
  type NewUserEmailAccountConfig,
  type UserEmailAccountConfig,
} from "@/lib/db/schema/tables/email"; // Adjusted import
import { decrypt, encrypt } from "@/lib/encryption";
import {
  addMailAccount as pleskAddMailAccount,
  deleteMailAccount as pleskDeleteMailAccount,
} from "@/lib/server/apis/email/client";
import type { AddMailNamePayload } from "@/lib/server/apis/email/types";
import { and, eq } from "drizzle-orm";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

export interface EmailMessage {
  uid: number;
  id: string | null;
  subject?: string;
  from?: { address?: string; name?: string };
  to?: { address?: string; name?: string }[];
  date?: Date;
  snippet?: string;
  body?: {
    html?: string | Buffer;
    text?: string | Buffer;
  };
  attachments?: any[];
  read: boolean;
}

async function getEmailAccountConfig(
  userId: string,
  emailAddress: string
): Promise<UserEmailAccountConfig | null> {
  const config = await db.query.pgUserEmailAccountConfigs.findFirst({
    where: and(
      eq(pgUserEmailAccountConfigs.userId, userId),
      eq(pgUserEmailAccountConfigs.emailAddress, emailAddress)
    ),
  });
  return config || null;
}

export async function fetchEmailsAction(
  emailAddress: string
): Promise<{ emails?: EmailMessage[]; error?: string }> {
  try {
    const cookieStore = await cookies();
    const user = await getUser(cookieStore);

    if (!user) return { error: "User not authenticated." };

    const config = await getEmailAccountConfig(user.id, emailAddress);
    if (!config) return { error: "Email account not configured." };

    const client = new ImapFlow({
      host: config.imapHost,
      port: config.imapPort,
      secure: config.imapSecure,
      auth: {
        user: config.imapUsername,
        pass: decrypt(config.encryptedImapPassword),
      },
      logger: process.env.NODE_ENV === "development" ? console : false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    const messages: EmailMessage[] = [];

    try {
      for await (const msg of client.fetch(
        { seq: "*:*-19" }, // Last 20 messages
        {
          uid: true,
          envelope: true,
          bodyStructure: true,
          flags: true,
          bodyPeek: { header: true, lines: 5 },
        }
      )) {
        const parsed = await simpleParser(msg.bodyPeek?.toString() || "");
        messages.push({
          uid: msg.uid,
          id: msg.envelope["message-id"] || null,
          subject: msg.envelope.subject,
          from: msg.envelope.from?.[0],
          to: msg.envelope.to,
          date: msg.envelope.date,
          snippet: parsed.text?.substring(0, 200) || "",
          read: msg.flags.has("\\Seen"),
        });
      }
    } finally {
      lock.release();
    }
    await client.logout();
    return {
      emails: messages.sort((a, b) =>
        b.date && a.date ? b.date.getTime() - a.date.getTime() : 0
      ),
    };
  } catch (error) {
    console.error("Fetch Emails Error:", error);
    return { error: error.message || "Failed to fetch emails." };
  }
}

export async function fetchEmailBodyAction(
  emailAddress: string,
  uid: number
): Promise<{ email?: EmailMessage; error?: string }> {
  try {
    const cookieStore = await cookies();
    const user = await getUser(cookieStore);

    if (!user) return { error: "User not authenticated." };

    const config = await getEmailAccountConfig(user.id, emailAddress);
    if (!config) return { error: "Email account not configured." };

    const client = new ImapFlow({
      host: config.imapHost,
      port: config.imapPort,
      secure: config.imapSecure,
      auth: {
        user: config.imapUsername,
        pass: decrypt(config.encryptedImapPassword),
      },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    let fullEmail: EmailMessage | undefined;

    try {
      const msg = await client.fetchOne(uid, {
        uid: true,
        envelope: true,
        bodyStructure: true,
        source: true,
        flags: true,
      });
      const parsed = await simpleParser(msg.source);
      fullEmail = {
        uid: msg.uid,
        id: msg.envelope["message-id"] || null,
        subject: msg.envelope.subject,
        from: msg.envelope.from?.[0],
        to: msg.envelope.to,
        date: msg.envelope.date,
        body: {
          html: parsed.html || undefined,
          text: parsed.text || undefined,
        },
        attachments: parsed.attachments,
        read: msg.flags.has("\\Seen"),
      };
      if (!msg.flags.has("\\Seen")) {
        await client.messageFlagsAdd(uid.toString(), ["\\Seen"]);
      }
    } finally {
      lock.release();
    }
    await client.logout();
    return { email: fullEmail };
  } catch (error) {
    console.error("Fetch Email Body Error:", error);
    return { error: error.message || "Failed to fetch email body." };
  }
}

export interface SendEmailPayload {
  fromAddress: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
}

export async function sendEmailAction(
  payload: SendEmailPayload
): Promise<{ success?: boolean; messageId?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const user = await getUser(cookieStore);

    if (!user) return { error: "User not authenticated." };

    const config = await getEmailAccountConfig(user.id, payload.fromAddress);
    if (!config) return { error: "Sender email account not configured." };

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure, // For port 465, true. For 587 (STARTTLS), false.
      auth: {
        user: config.smtpUsername,
        pass: decrypt(config.encryptedSmtpPassword),
      },
      // Some servers might require explicit STARTTLS if secure is false
      ...(config.smtpPort === 587 &&
        !config.smtpSecure && { requireTLS: true }),
    });

    const mailOptions = {
      from: `"${user.name || payload.fromAddress.split("@")[0]}" <${payload.fromAddress}>`,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      text: payload.textBody,
      html: payload.htmlBody,
      attachments: payload.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Send Email Error:", error);
    return { error: error.message || "Failed to send email." };
  }
}

export interface EmailAccountFormData
  extends Omit<
    NewUserEmailAccountConfig,
    | "id"
    | "userId"
    | "createdAt"
    | "updatedAt"
    | "emailPassword"
    | "encryptedImapPassword"
    | "encryptedSmtpPassword"
  > {
  emailPasswordPlesk?: string; // Used for Plesk creation and then encrypted for general use if IMAP/SMTP pass is same
  imapPassword?: string; // Specific IMAP password if different
  smtpPassword?: string; // Specific SMTP password if different
  domain: string; // needed for plesk
}

export async function saveEmailAccountConfigAction(
  formData: EmailAccountFormData
): Promise<{
  success?: boolean;
  error?: string;
  data?: UserEmailAccountConfig;
}> {
  const cookieStore = await cookies();
  const user = await getUser(cookieStore);

  if (!user) return { error: "User not authenticated." };

  const {
    emailAddress,
    imapHost,
    imapPort,
    imapUsername,
    imapSecure,
    smtpHost,
    smtpPort,
    smtpUsername,
    smtpSecure,
    isPleskManaged,
    pleskSiteId,
    emailPasswordPlesk,
    imapPassword,
    smtpPassword,
  } = formData;

  if (
    !emailAddress ||
    !imapHost ||
    !imapPort ||
    !imapUsername ||
    !smtpHost ||
    !smtpPort ||
    !smtpUsername
  ) {
    return { error: "Missing required email configuration fields." };
  }

  // Determine which passwords to encrypt
  const finalImapPassword = imapPassword || emailPasswordPlesk;
  const finalSmtpPassword = smtpPassword || emailPasswordPlesk;

  if (!finalImapPassword || !finalSmtpPassword) {
    return { error: "IMAP and SMTP passwords are required." };
  }

  try {
    const newConfigData: NewUserEmailAccountConfig = {
      userId: user.id,
      emailAddress,
      emailPassword: encrypt(emailPasswordPlesk || finalImapPassword),
      imapHost,
      imapPort,
      imapUsername,
      encryptedImapPassword: encrypt(finalImapPassword),
      imapSecure,
      smtpHost,
      smtpPort,
      smtpUsername,
      encryptedSmtpPassword: encrypt(finalSmtpPassword),
      smtpSecure,
      isPleskManaged: isPleskManaged || false,
      pleskSiteId: pleskSiteId || undefined,
    };

    const existingConfig = await db.query.pgUserEmailAccountConfigs.findFirst({
      where: and(
        eq(pgUserEmailAccountConfigs.userId, user.id),
        eq(pgUserEmailAccountConfigs.emailAddress, emailAddress)
      ),
    });

    let savedConfig: UserEmailAccountConfig;
    if (existingConfig) {
      const [updated] = await db
        .update(pgUserEmailAccountConfigs)
        .set({ ...newConfigData, updatedAt: new Date() })
        .where(eq(pgUserEmailAccountConfigs.id, existingConfig.id))
        .returning();
      savedConfig = updated;
    } else {
      const [inserted] = await db
        .insert(pgUserEmailAccountConfigs)
        .values(newConfigData)
        .returning();
      savedConfig = inserted;
    }

    revalidatePath("/email");
    return { success: true, data: savedConfig };
  } catch (error: any) {
    console.error("Save Email Config Error:", error);
    return { error: error.message || "Failed to save email configuration." };
  }
}

// Modified to integrate with pgUserEmailAccountConfigs
export async function createPleskEmailAccountAction(pleskFormData: {
  domain: string;
  username: string; // local part of email
  passwordPlesk: string; // Password for Plesk and the email account itself
  firstName?: string;
  lastName?: string;
  quotaMB?: number;
  // Plesk-specific IMAP/SMTP details, if they are standard for your Plesk server
  pleskImapHost: string;
  pleskImapPort: number;
  pleskImapSecure: boolean;
  pleskSmtpHost: string;
  pleskSmtpPort: number;
  pleskSmtpSecure: boolean;
}) {
  return;
  // const cookieStore = await cookies();
  // const user = await getUser(cookieStore);

  // if (!user) return { error: "User not authenticated." };

  // const {
  //   domain,
  //   username,
  //   passwordPlesk,
  //   quotaMB,
  //   pleskImapHost,
  //   pleskImapPort,
  //   pleskImapSecure,
  //   pleskSmtpHost,
  //   pleskSmtpPort,
  //   pleskSmtpSecure,
  // } = pleskFormData;

  // if (!domain || !username || !passwordPlesk) {
  //   return {
  //     error: "Domain, username, and password are required for Plesk account.",
  //   };
  // }
  // if (!pleskImapHost || !pleskSmtpHost) {
  //   return { error: "Plesk IMAP/SMTP server details must be provided." };
  // }

  // const emailAddress = `${username}@${domain}`;

  // const site = await db.query.sites.findFirst({
  //   where: and(eq(sites.domainName, domain), eq(sites.userId, user.id)),
  // });
  // if (!site?.pleskSiteId) {
  //   return {
  //     error: `Plesk site ID not found for domain ${domain}. Cannot create email via Plesk.`,
  //   };
  // }

  // const mailAccountData: AddMailNamePayload["mailname"] = {
  //   name: username,
  //   password: { value: passwordPlesk, type: "plain" },
  //   mailbox: {
  //     enabled: true,
  //     quota: quotaMB ? quotaMB * 1024 * 1024 : -1, // Plesk uses bytes
  //   },
  //   ...(pleskFormData.firstName && {
  //     properties: [
  //       {
  //         name: "name",
  //         value:
  //           `${pleskFormData.firstName} ${pleskFormData.lastName || ""}`.trim(),
  //       },
  //     ],
  //   }),
  // };

  // try {
  //   await pleskAddMailAccount(site.pleskSiteId, mailAccountData);

  //   // Now save this configuration to our app's DB
  //   const configToSave: EmailAccountFormData = {
  //     emailAddress,
  //     domain, // Pass domain for context
  //     emailPasswordPlesk: passwordPlesk, // This is the key password
  //     imapHost: pleskImapHost, // Use pre-configured Plesk IMAP details
  //     imapPort: pleskImapPort,
  //     imapUsername: emailAddress, // Typically full email for Plesk
  //     imapSecure: pleskImapSecure,
  //     // imapPassword will use emailPasswordPlesk by default in saveEmailAccountConfigAction

  //     smtpHost: pleskSmtpHost, // Use pre-configured Plesk SMTP details
  //     smtpPort: pleskSmtpPort,
  //     smtpUsername: emailAddress, // Typically full email for Plesk
  //     smtpSecure: pleskSmtpSecure,
  //     // smtpPassword will use emailPasswordPlesk by default

  //     isPleskManaged: true,
  //     pleskSiteId: site.pleskSiteId,
  //   };

  //   const saveResult = await saveEmailAccountConfigAction(configToSave);
  //   if (saveResult.error) {
  //     // Rollback Plesk creation or log inconsistency? For now, just report.
  //     return {
  //       error: `Plesk account created, but failed to save config: ${saveResult.error}`,
  //     };
  //   }

  //   revalidatePath("/email");
  //   return {
  //     success: true,
  //     message: "Plesk email account created and configured.",
  //   };
  // } catch (error) {
  //   console.error("Create Plesk Email Error:", error);
  //   return { error: error.message || "Failed to create Plesk email account." };
  // }
}

export async function deleteEmailAccountAction(
  emailAddress: string,
  domain: string
) {
  const cookieStore = await cookies();
  const user = await getUser(cookieStore);

  if (!user) return { error: "User not authenticated." };

  const config = await getEmailAccountConfig(user.id, emailAddress);
  if (!config)
    return { error: "Email account configuration not found in app." };

  try {
    // Delete from our app's config DB first
    await db
      .delete(pgUserEmailAccountConfigs)
      .where(eq(pgUserEmailAccountConfigs.id, config.id));

    // If it was Plesk managed, attempt to delete from Plesk
    if (config.isPleskManaged && config.pleskSiteId) {
      const mailName = emailAddress.split("@")[0];
      try {
        await pleskDeleteMailAccount(config.pleskSiteId, mailName);
      } catch (pleskError: any) {
        // Log Plesk error but proceed as local config is deleted
        console.warn(
          `Failed to delete email ${emailAddress} from Plesk site ID ${config.pleskSiteId}: ${pleskError.message}`
        );
        return {
          success: true,
          message: `Local config deleted. Plesk deletion failed: ${pleskError.message}. Please check Plesk manually.`,
        };
      }
    }
    revalidatePath("/email");
    return { success: true, message: "Email account configuration deleted." };
  } catch (error: any) {
    console.error("Delete Email Account Error:", error);
    return { error: error.message || "Failed to delete email account." };
  }
}

// Fetch configured accounts for the user and domain
export async function getManagedEmailAccountsAction(
  domainName: string
): Promise<{ accounts?: UserEmailAccountConfig[]; error?: string }> {
  const cookieStore = await cookies();
  const user = await getUser(cookieStore);

  if (!user) return { error: "User not authenticated." };

  try {
    const accounts = await db.query.pgUserEmailAccountConfigs.findMany({
      where: and(
        eq(pgUserEmailAccountConfigs.userId, user.id),
        // Assuming emailAddress ends with "@domainName"
        // For more precise matching if emailAddress can be arbitrary, you might need a 'domain' field in pgUserEmailAccountConfigs
        eq(pgUserEmailAccountConfigs.emailAddress.split("@")[1], domainName)
      ),
      orderBy: pgUserEmailAccountConfigs.emailAddress,
    });
    return { accounts };
  } catch (error: any) {
    console.error("Error fetching managed accounts:", error);
    return { error: "Failed to fetch managed email accounts." };
  }
}
