const axios = require("axios");
const https = require("node:https");

const apiUrl = "https://pro120.dns-pro.com.br:8443/api/v2";

async function testNoAuth() {
  console.log("\nTesting connection WITHOUT Authentication...");
  try {
    const response = await axios.get(`${apiUrl}/server`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
    console.log(`  Status: ${response.status}`);
    console.log(`  Body: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.log(`  Status: ${error.response?.status || "ERROR"}`);
    console.log(`  Body: ${JSON.stringify(error.response?.data || "EMPTY")}`);
  }
}

testNoAuth();
