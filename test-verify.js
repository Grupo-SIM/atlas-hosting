const axios = require("axios");
const https = require("node:https");

const apiUrl = "https://pro120.dns-pro.com.br:8443/api/v2";
const apiKey = "63d8cf19-4805-7419-c0c7-ba587299fee3";

async function testVerbose() {
  console.log("\nTesting connection after Whitelist...");
  try {
    const response = await axios.get(`${apiUrl}/domains`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "X-API-Key": apiKey,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
    console.log(`  SUCCESS! Status: ${response.status}`);
    console.log(
      `  Sample Data: ${JSON.stringify(response.data).substring(0, 200)}`
    );
  } catch (error) {
    console.log(`  FAILED! Status: ${error.response?.status || "NO_STATUS"}`);
    console.log(
      `  Response Body: ${JSON.stringify(error.response?.data || "EMPTY")}`
    );
    console.log(
      `  Headers: ${JSON.stringify(error.response?.headers || "EMPTY")}`
    );
  }
}

testVerbose();
