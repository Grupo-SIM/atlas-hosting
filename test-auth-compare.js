
const axios = require('axios');
const https = require('https');

const apiUrl = "https://pro120.dns-pro.com.br:8443/api/v2";
const apiKey = "63d8cf19-4805-7419-c0c7-ba587299fee3";
const username = "jbmi4779";
const password = "p.9:gxH513nCGE";

async function testAuth() {
  console.log(`\nTesting API Key...`);
  try {
    const res = await axios.get(`${apiUrl}/domains`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: { 'X-API-Key': apiKey }
    });
    console.log(`  API Key: SUCCESS`);
  } catch (e) {
    console.log(`  API Key: FAILED (${e.response?.status || e.message})`);
  }

  console.log(`\nTesting Basic Auth...`);
  try {
    const res = await axios.get(`${apiUrl}/domains`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      auth: { username, password }
    });
    console.log(`  Basic Auth: SUCCESS`);
  } catch (e) {
    console.log(`  Basic Auth: FAILED (${e.response?.status || e.message})`);
  }
}

testAuth();
