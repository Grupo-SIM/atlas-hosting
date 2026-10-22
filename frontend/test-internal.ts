const pleskApi = require("./src/lib/server/apis/plesk/index.ts").default;

async function test() {
  console.log("Starting internal test...");
  try {
    const domains = await pleskApi.getDomain("avant-glp.lat");
    console.log("Internal Test Success:", domains ? "Found" : "Not Found");
  } catch (error) {
    console.log("Internal Test Failed:", error.message);
  }
}

test();
