const axios = require("axios");
const https = require("node:https");

const apiUrl = process.env.PLESK_API_URL;
const rootUser = process.env.PLESK_ROOT_USER;
const rootPassword = process.env.PLESK_ROOT_PASSWORD;
const apiKey = process.env.PLESK_API_KEY;

console.log("Environment Variables:");
console.log("PLESK_API_URL:", apiUrl);
console.log("PLESK_ROOT_USER:", rootUser);
console.log("PLESK_ROOT_PASSWORD:", rootPassword ? "****" : "MISSING");
console.log("PLESK_API_KEY:", apiKey ? "****" : "MISSING");

async function testBasicAuth() {
  console.log("\nTesting Basic Auth...");
  try {
    const response = await axios.get(`${apiUrl}/server`, {
      auth: {
        password: rootPassword,
        username: rootUser,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
    console.log("Basic Auth Success:", response.status);
    return true;
  } catch (error) {
    console.log("Basic Auth Failed:", error.response?.status || error.message);
    return false;
  }
}

async function run() {
  if (!apiUrl) {
    console.error("PLESK_API_URL is missing!");
    return;
  }
  await testBasicAuth();
}

run();
