#!/usr/bin/env bun

/**
 * Test script to verify email integration functionality
 * This script tests the IMAP and SMTP functionality with Plesk email accounts
 */

import type { EmailToSend } from "@/lib/server/apis/email";
import { createImapClient, createSmtpClient } from "@/lib/server/apis/email";

// Mock configuration for testing
const mockEmailConfig = {
  encryptedImapPassword: "encrypted_password_here", // This would be encrypted in real usage
  encryptedSmtpPassword: "encrypted_password_here", // This would be encrypted in real usage
  imapHost: "mail.leuilipe.top",
  imapPort: 993,
  imapSecure: true,
  imapUsername: "neusa@leuilipe.top",
  smtpHost: "mail.leuilipe.top",
  smtpPort: 465,
  smtpSecure: true,
  smtpUsername: "neusa@leuilipe.top",
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
      folders.map(f => f.name)
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
      html: "<p>This is a <strong>test email</strong> to verify SMTP functionality.</p>",
      subject: "Test Email from Atlas Hosting",
      text: "This is a test email to verify SMTP functionality.",
      to: "test@example.com", // Safe test recipient
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
