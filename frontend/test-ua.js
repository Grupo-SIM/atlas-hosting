const axios = require("axios");
const https = require("node:https");

const apiUrl = "https://pro120.dns-pro.com.br:8443/api/v2";
const apiKey = "63d8cf19-4805-7419-c0c7-ba587299fee3";

async function testWithUserAgent(ua) {
  console.log(`\nTesting with User-Agent: ${ua || "NONE"}`);
  try {
    const response = await axios.get(`${apiUrl}/domains`, {
      headers: {
        "User-Agent":
          ua ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "X-API-Key": apiKey,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      params: { name: "avant-glp.lat" },
    });
    console.log(`  Status: ${response.status}`);
    console.log(
      `  Data: ${JSON.stringify(response.data).substring(0, 100)}...`
    );
  } catch (error) {
    console.log(`  FAILED: ${error.response?.status || error.message}`);
    if (error.response?.data)
      console.log(`  Data: ${JSON.stringify(error.response.data)}`);
  }
}

async function run() {
  await testWithUserAgent(); // Default custom UA
  await testWithUserAgent("axios/1.6.7"); // Default axios UA
}

run();
