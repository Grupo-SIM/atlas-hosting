
const axios = require('axios');
const https = require('https');

const apiUrl = "https://pro120.dns-pro.com.br:8443/api/v2";
const apiKey = "63d8cf19-4805-7419-c0c7-ba587299fee3";

async function testDomain(domain) {
  console.log(`\nTesting access for ${domain}...`);
  try {
    const response = await axios.get(`${apiUrl}/domains`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: { 'X-API-Key': apiKey },
      params: { name: domain }
    });
    console.log(`  SUCCESS: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.log(`  FAILED: ${error.response?.status || error.message}`);
    if (error.response?.data) console.log(`  Data: ${JSON.stringify(error.response.data)}`);
  }
}

async function run() {
  await testDomain("avant-glp.lat");
}

run();
