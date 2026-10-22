import { getDomainData } from "./src/app/(auth)/domain/utils";

async function test() {
  const data = await getDomainData("teste.dev");
  console.log("DOMAIN DATA:", JSON.stringify(data, null, 2));
}

test();
