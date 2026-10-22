const axios = require("axios");
const https = require("node:https");

const servers = [
  {
    key: "63d8cf19-4805-7419-c0c7-ba587299fee3",
    name: "pro120.dns-pro.com.br",
    url: "https://pro120.dns-pro.com.br:8443/api/v2",
  },
  {
    key: "63d8cf19-4805-7419-c0c7-ba587299fee3",
    name: "painel.meuservidor.inf.br",
    url: "https://painel.meuservidor.inf.br/api/v2", // Added v2 just in case
  },
];

async function testServer(server) {
  console.log(`\nTesting ${server.name} (${server.url})...`);
  try {
    const response = await axios.get(`${server.url}/server`, {
      headers: { "X-API-Key": server.key },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 5000,
    });
    console.log(`  /server: SUCCESS (${response.status})`);
  } catch (error) {
    console.log(
      `  /server: FAILED (${error.response?.status || error.message})`
    );
  }

  try {
    const response = await axios.get(`${server.url}/domains`, {
      headers: { "X-API-Key": server.key },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 5000,
    });
    console.log(`  /domains: SUCCESS (${response.status})`);
  } catch (error) {
    console.log(
      `  /domains: FAILED (${error.response?.status || error.message})`
    );
  }
}

async function run() {
  for (const s of servers) {
    await testServer(s);
  }
}

run();
