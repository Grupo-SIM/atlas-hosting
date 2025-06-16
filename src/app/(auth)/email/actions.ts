"use server";

import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganizationDomains, pgUserEmailAccountConfigs } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addMailAccount, deleteMailAccount, getMailAccounts, getDomain } from "@/lib/server/apis/plesk-xml/client";
import type { MailName } from "@/lib/server/apis/plesk-xml/types";
import { encrypt } from "@/lib/encryption";
import { getUserCurrentDomain } from "@/lib/server/utils";
import { createImapClient, createSmtpClient } from "@/lib/server/apis/email";
import type { EmailMessage, EmailToSend } from "@/lib/server/apis/email";

// Get user's Plesk mail accounts
export async function getPleskMailAccounts() {
  try {
    const user = await getUser();
    
    // Get user's currently selected domain
    const selectedDomain = await getUserCurrentDomain(user);
    
    if (!selectedDomain) {
      return { success: false, error: "No domain selected. Please select a domain first." };
    }

    // Get the Plesk site ID for the selected domain
    const pleskSite = await getDomain(selectedDomain.domain);
    
    if (!pleskSite?.id) {
      return { success: false, error: `Domain ${selectedDomain.domain} not found in Plesk or not configured for hosting.` };
    }

    // Fetch real mail accounts from Plesk
    const mailAccounts = await getMailAccounts(pleskSite.id);
    
    return { success: true, data: mailAccounts };
  } catch (error) {
    console.error("Error fetching Plesk mail accounts:", error);
    return { success: false, error: "Failed to fetch mail accounts from server" };
  }
}

// Create new Plesk mail account
export async function createPleskMailAccount(formData: FormData) {
  try {
    const user = await getUser();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const displayName = formData.get("displayName") as string;
    const quota = Number.parseInt(formData.get("quota") as string) || 1000; // Default 1GB in MB

    if (!username || !password) {
      return { success: false, error: "Missing required fields: username and password" };
    }

    // Get user's currently selected domain
    const selectedDomain = await getUserCurrentDomain(user);
    
    if (!selectedDomain) {
      return { success: false, error: "No domain selected. Please select a domain first." };
    }

    // Get the Plesk site ID for the selected domain
    const pleskSite = await getDomain(selectedDomain.domain);
    
    if (!pleskSite?.id) {
      return { success: false, error: `Domain ${selectedDomain.domain} not found in Plesk or not configured for hosting.` };
    }

    // Create mail account in Plesk
    const pleskResponse = await addMailAccount(pleskSite.id, {
      name: username, // This is the local part (before @)
      mailbox: {
        enabled: true,
        // quota: quota * 1024 * 1024, // Convert MB to bytes
      },
      password: {
        value: password,
        type: "plain"
      }
    });

    // Store account in database
    const emailAddress = `${username}@${selectedDomain.domain}`;
    const encryptedPassword = await encrypt(password);

    await db.insert(pgUserEmailAccountConfigs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      emailAddress,
      emailPassword: encryptedPassword,
      
      // IMAP settings (Plesk default)
      imapHost: `mail.${selectedDomain.domain}`,
      imapPort: 993,
      imapUsername: emailAddress,
      encryptedImapPassword: encryptedPassword,
      imapSecure: true,
      
      // SMTP settings (Plesk default)
      smtpHost: `mail.${selectedDomain.domain}`,
      smtpPort: 465,
      smtpUsername: emailAddress,
      encryptedSmtpPassword: encryptedPassword,
      smtpSecure: true,
      
      // Plesk integration
      isPleskManaged: true,
      pleskSiteId: pleskSite.id,
      pleskMailId: pleskResponse.id, // Store the Plesk mail account ID
    });

    revalidatePath("/email");
    return { success: true, data: { id: pleskResponse.id, emailAddress } };
  } catch (error) {
    console.error("Error creating Plesk mail account:", error);
    return { success: false, error: "Failed to create mail account" };
  }
}

// Delete Plesk mail account
export async function deletePleskMailAccount(mailAccountId: number) {
  try {
    const user = await getUser();
    
    // Find the email account config that matches the Plesk mail ID
    const accountConfig = await db.query.pgUserEmailAccountConfigs.findFirst({
      where: and(
        eq(pgUserEmailAccountConfigs.userId, user.id),
        eq(pgUserEmailAccountConfigs.pleskMailId, mailAccountId),
        eq(pgUserEmailAccountConfigs.isPleskManaged, true)
      ),
    });

    if (!accountConfig) {
      return { success: false, error: "Mail account not found or not managed by Plesk" };
    }
    
    // Delete from Plesk using the real API
    await deleteMailAccount(mailAccountId);
    
    // Delete from database
    await db.delete(pgUserEmailAccountConfigs).where(
      eq(pgUserEmailAccountConfigs.id, accountConfig.id)
    );
    
    revalidatePath("/email");
    return { success: true };
  } catch (error) {
    console.error("Error deleting Plesk mail account:", error);
    return { success: false, error: "Failed to delete mail account" };
  }
}

// Get user's domains eligible for email
export async function getDomainsForEmail() {
  try {
    const user = await getUser();
    
    // Get user's currently selected domain for email management
    const selectedDomain = await getUserCurrentDomain(user);
    
    if (!selectedDomain) {
      return { success: false, error: "No domain selected. Please select a domain first." };
    }
    
    // Return the selected domain as the available domain for email
    return { success: true, data: [selectedDomain] };
  } catch (error) {
    console.error("Error fetching domains for email:", error);
    return { success: false, error: "Failed to fetch domains" };
  }
}

// Get email account settings from database
export async function getEmailAccountSettings() {
  try {
    const user = await getUser();
    
    const accounts = await db.query.pgUserEmailAccountConfigs.findMany({
      where: and(
        eq(pgUserEmailAccountConfigs.userId, user.id),
        eq(pgUserEmailAccountConfigs.isPleskManaged, true)
      ),
    });

    return { success: true, data: accounts };
  } catch (error) {
    console.error("Error fetching email account settings:", error);
    return { success: false, error: "Failed to fetch account settings" };
  }
}

// Get email messages from IMAP server
export async function getEmailMessages(accountId: string, folder = "INBOX") {
  try {
    const user = await getUser();
    
    // Get the email account configuration
    const accountConfig = await db.query.pgUserEmailAccountConfigs.findFirst({
      where: and(
        eq(pgUserEmailAccountConfigs.id, accountId),
        eq(pgUserEmailAccountConfigs.userId, user.id),
        eq(pgUserEmailAccountConfigs.isPleskManaged, true)
      ),
    });

    if (!accountConfig) {
      return { success: false, error: "Email account not found" };
    }

    // Create IMAP client and fetch emails
    const imapClient = await createImapClient(accountConfig);
    await imapClient.connect();
    
    try {
      const emails = await imapClient.getEmails(folder, 50);
      return { success: true, data: emails };
    } finally {
      await imapClient.disconnect();
    }
  } catch (error) {
    console.error("Error fetching email messages:", error);
    return { success: false, error: "Failed to fetch email messages" };
  }
}

// Get email folders from IMAP server
export async function getEmailFolders(accountId: string) {
  try {
    const user = await getUser();
    
    // Get the email account configuration
    const accountConfig = await db.query.pgUserEmailAccountConfigs.findFirst({
      where: and(
        eq(pgUserEmailAccountConfigs.id, accountId),
        eq(pgUserEmailAccountConfigs.userId, user.id),
        eq(pgUserEmailAccountConfigs.isPleskManaged, true)
      ),
    });

    if (!accountConfig) {
      return { success: false, error: "Email account not found" };
    }

    // Create IMAP client and fetch folders
    const imapClient = await createImapClient(accountConfig);
    await imapClient.connect();
    
    try {
      const folders = await imapClient.getFolders();
      return { success: true, data: folders };
    } finally {
      await imapClient.disconnect();
    }
  } catch (error) {
    console.error("Error fetching email folders:", error);
    return { success: false, error: "Failed to fetch email folders" };
  }
}

// Send email using SMTP
export async function sendEmail(formData: FormData) {
  try {
    const user = await getUser();
    const accountId = formData.get("accountId") as string;
    const to = formData.get("to") as string;
    const cc = formData.get("cc") as string;
    const bcc = formData.get("bcc") as string;
    const subject = formData.get("subject") as string;
    const text = formData.get("text") as string;
    const html = formData.get("html") as string;

    if (!accountId || !to || !subject) {
      return { success: false, error: "Missing required fields" };
    }

    // Get the email account configuration
    const accountConfig = await db.query.pgUserEmailAccountConfigs.findFirst({
      where: and(
        eq(pgUserEmailAccountConfigs.id, accountId),
        eq(pgUserEmailAccountConfigs.userId, user.id),
        eq(pgUserEmailAccountConfigs.isPleskManaged, true)
      ),
    });

    if (!accountConfig) {
      return { success: false, error: "Email account not found" };
    }

    // Create SMTP client and send email
    const smtpClient = await createSmtpClient(accountConfig);
    
    try {
      const emailToSend: EmailToSend = {
        from: accountConfig.emailAddress,
        to: to.split(",").map(email => email.trim()),
        cc: cc ? cc.split(",").map(email => email.trim()) : undefined,
        bcc: bcc ? bcc.split(",").map(email => email.trim()) : undefined,
        subject,
        text: text || undefined,
        html: html || undefined,
      };

      const result = await smtpClient.sendEmail(emailToSend);
      
      return { 
        success: true, 
        data: {
          messageId: result.messageId,
          accepted: result.accepted,
          rejected: result.rejected
        }
      };
    } finally {
      await smtpClient.disconnect();
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Mark email as read
export async function markEmailAsRead(accountId: string, messageId: string, folder = "INBOX") {
  try {
    const user = await getUser();
    
    // Get the email account configuration
    const accountConfig = await db.query.pgUserEmailAccountConfigs.findFirst({
      where: and(
        eq(pgUserEmailAccountConfigs.id, accountId),
        eq(pgUserEmailAccountConfigs.userId, user.id),
        eq(pgUserEmailAccountConfigs.isPleskManaged, true)
      ),
    });

    if (!accountConfig) {
      return { success: false, error: "Email account not found" };
    }

    // Create IMAP client and mark as read
    const imapClient = await createImapClient(accountConfig);
    await imapClient.connect();
    
    try {
      await imapClient.markAsRead(messageId, folder);
      return { success: true };
    } finally {
      await imapClient.disconnect();
    }
  } catch (error) {
    console.error("Error marking email as read:", error);
    return { success: false, error: "Failed to mark email as read" };
  }
}

// Delete email
export async function deleteEmail(accountId: string, messageId: string, folder = "INBOX") {
  try {
    const user = await getUser();
    
    // Get the email account configuration
    const accountConfig = await db.query.pgUserEmailAccountConfigs.findFirst({
      where: and(
        eq(pgUserEmailAccountConfigs.id, accountId),
        eq(pgUserEmailAccountConfigs.userId, user.id),
        eq(pgUserEmailAccountConfigs.isPleskManaged, true)
      ),
    });

    if (!accountConfig) {
      return { success: false, error: "Email account not found" };
    }

    // Create IMAP client and delete email
    const imapClient = await createImapClient(accountConfig);
    await imapClient.connect();
    
    try {
      await imapClient.deleteMessage(messageId, folder);
      return { success: true };
    } finally {
      await imapClient.disconnect();
    }
  } catch (error) {
    console.error("Error deleting email:", error);
    return { success: false, error: "Failed to delete email" };
  }
}

// Reload email accounts action
export async function reloadEmailAccounts() {
  revalidatePath("/email");
  return;
}
