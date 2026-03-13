
const axios = require('axios');
const https = require('https');

const apiUrl = "https://pro120.dns-pro.com.br:8443/api/v2";
const rootUser = "jbmi4779";
const rootPassword = "p.9:gxH513nCGE";
const apiKey = "63d8cf19-4805-7419-c0c7-ba587299fee3";

async function testBasicAuth() {
  console.log("Testing Basic Auth...");
  try {
    const response = await axios.get(`${apiUrl}/server`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      auth: {
        username: rootUser,
        password: rootPassword,
      },
    });
    console.log("Basic Auth Success:", response.status);
    return true;
  } catch (error) {
    console.log("Basic Auth Failed:", error.response?.status || error.message);
    if (error.response?.data) console.log(JSON.stringify(error.response.data));
    return false;
  }
}

async function testApiKey() {
  console.log("\nTesting API Key...");
  try {
    const response = await axios.get(`${apiUrl}/server`, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'X-API-Key': apiKey,
      },
    });
    console.log("API Key Success:", response.status);
    return true;
  } catch (error) {
    console.log("API Key Failed:", error.response?.status || error.message);
    if (error.response?.data) console.log(JSON.stringify(error.response.data));
    return false;
  }
}

async function run() {
  await testBasicAuth();
  await testApiKey();
}

run();
