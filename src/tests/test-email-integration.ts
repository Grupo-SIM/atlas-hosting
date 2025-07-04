#!/usr/bin/env bun

/**
 * Test script to verify email integration functionality
 * This script tests the IMAP and SMTP functionality with Plesk email accounts
 */

import { createImapClient, createSmtpClient } from "@/lib/server/apis/email";
import type { EmailToSend } from "@/lib/server/apis/email";

// Mock configuration for testing
const mockEmailConfig = {
  imapHost: "mail.leuilipe.top",
  imapPort: 993,
  imapUsername: "neusa@leuilipe.top",
  encryptedImapPassword: "encrypted_password_here", // This would be encrypted in real usage
  imapSecure: true,
  smtpHost: "mail.leuilipe.top",
  smtpPort: 465,
  smtpUsername: "neusa@leuilipe.top",
  encryptedSmtpPassword: "encrypted_password_here", // This would be encrypted in real usage
  smtpSecure: true,
};

console.log("🧪 Testing Email Integration...\n");

async function testImapConnection() {
  console.log("📥 Testing IMAP Connection...");

  try {
    // Note: In real usage, we would decrypt the password
    const imapClient = await createImapClient({
      ...mockEmailConfig,
      encryptedImapPassword: "OI4iDSx*TRpY", // Using plain password for test
    });

    await imapClient.connect();
    console.log("✅ IMAP connection successful");

    const folders = await imapClient.getFolders();
    console.log(
      `📁 Found ${folders.length} folders:`,
      folders.map((f) => f.name)
    );

    const emails = await imapClient.getEmails("INBOX", 10);
    console.log(`📧 Found ${emails.length} emails in INBOX`);

    if (emails.length > 0) {
      const firstEmail = emails[0];
      console.log(
        `📧 First email: "${firstEmail.subject}" from ${firstEmail.from}`
      );
    }

    await imapClient.disconnect();

    return true;
  } catch (error) {
    console.error("❌ IMAP test failed:", error);
    return false;
  }
}

async function testSmtpConnection() {
  console.log("\n📤 Testing SMTP Connection...");

  try {
    // Note: In real usage, we would decrypt the password
    const smtpClient = await createSmtpClient({
      ...mockEmailConfig,
      encryptedSmtpPassword: "OI4iDSx*TRpY", // Using plain password for test
    });

    console.log("✅ SMTP connection successful");

    const testEmail: EmailToSend = {
      from: "neusa@leuilipe.top",
      to: "test@example.com", // Safe test recipient
      subject: "Test Email from Atlas Hosting",
      text: "This is a test email to verify SMTP functionality.",
      html: "<p>This is a <strong>test email</strong> to verify SMTP functionality.</p>",
    };

    // Uncomment to actually send test email
    // const result = await smtpClient.sendEmail(testEmail);
    // console.log('📧 Test email sent:', result);

    console.log("📧 SMTP test prepared (email not sent to avoid spam)");

    await smtpClient.disconnect();

    return true;
  } catch (error) {
    console.error("❌ SMTP test failed:", error);
    return false;
  }
}

async function runTests() {
  console.log("Starting email integration tests...\n");

  const imapResult = await testImapConnection();
  const smtpResult = await testSmtpConnection();

  console.log("\n📊 Test Results:");
  console.log(`📥 IMAP: ${imapResult ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`📤 SMTP: ${smtpResult ? "✅ PASS" : "❌ FAIL"}`);

  if (imapResult && smtpResult) {
    console.log("\n🎉 All email integration tests passed!");
    console.log(
      "✨ Real email functionality is now available in the email interface"
    );
  } else {
    console.log(
      "\n⚠️ Some tests failed. Check your email server configuration."
    );
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  runTests().catch(console.error);
}

export { testImapConnection, testSmtpConnection };
