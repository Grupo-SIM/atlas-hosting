
const axios = require('axios');
const https = require('https');

const apiUrl = "https://pro120.dns-pro.com.br:8443/api/v2";
const apiKey = "63d8cf19-4805-7419-c0c7-ba587299fee3";

async function testServer() {
  console.log(`\nTesting /server with API Key...`);
  try {
    const res = await axios.get(`${apiUrl}/server`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: { 'X-API-Key': apiKey }
    });
    console.log(`  SUCCESS! Server Status: ${res.status}`);
    console.log(`  Data: ${JSON.stringify(res.data)}`);
  } catch (e) {
    console.log(`  FAILED! Status: ${e.response?.status}`);
    console.log(`  Body: ${JSON.stringify(e.response?.data || "EMPTY")}`);
  }
}

testServer();
