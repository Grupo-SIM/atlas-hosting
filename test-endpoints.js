
const axios = require('axios');
const https = require('https');

const apiUrl = "https://pro120.dns-pro.com.br:8443/api/v2";
const apiKey = "63d8cf19-4805-7419-c0c7-ba587299fee3";

async function testEndpoint(endpoint) {
  console.log(`\nTesting ${endpoint}...`);
  try {
    const response = await axios.get(`${apiUrl}${endpoint}`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: { 'X-API-Key': apiKey }
    });
    console.log(`  Status: ${response.status}`);
    console.log(`  Body Prefix: ${JSON.stringify(response.data).substring(0, 50)}`);
  } catch (error) {
    console.log(`  FAILED: ${error.response?.status || error.message}`);
    if (error.response?.data) console.log(`  Body: ${JSON.stringify(error.response.data)}`);
  }
}

async function run() {
  await testEndpoint("/server");
  await testEndpoint("/domains");
}

run();
