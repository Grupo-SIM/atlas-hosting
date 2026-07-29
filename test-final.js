const axios = require("axios");
const https = require("node:https");

const apiUrl = "https://pro120.dns-pro.com.br:8443/api/v2";
const apiKey = "63d8cf19-4805-7419-c0c7-ba587299fee3";

async function testWithFullHeaders() {
  console.log("\nTesting with Full Browser Headers...");
  try {
    const response = await axios.get(`${apiUrl}/domains`, {
      headers: {
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        Referer: `${apiUrl}/`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "X-API-Key": apiKey,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      params: { name: "avant-glp.lat" },
    });
    console.log(`  Status: ${response.status}`);
    console.log(`  Data: ${JSON.stringify(response.data).substring(0, 500)}`);
  } catch (error) {
    console.log(`  FAILED: ${error.response?.status || error.message}`);
    if (error.response?.data)
      console.log(`  Body: ${JSON.stringify(error.response.data)}`);
  }
}

testWithFullHeaders();
