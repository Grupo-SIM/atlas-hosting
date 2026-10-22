#!/usr/bin/env bun

// Test table parsing with real wp-cli output
function parseTableOutput(output: string): Record<string, string>[] {
  if (!output?.trim()) return [];

  const lines = output.trim().split("\n");
  if (lines.length < 2) return [];

  // First line contains headers
  const headerLine = lines[0];
  const headers = headerLine
    .split(/\s{2,}/)
    .map(h => h.trim())
    .filter(Boolean);

  const results: Record<string, string>[] = [];

  // Parse each data line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by multiple spaces to separate columns
    const values = line.split(/\s{2,}/).map(v => v.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    results.push(row);
  }

  return results;
}

// Test with sample plugin output
const samplePluginOutput = `name                      status   version   update   title
hello-dolly               active   1.7.2     none     Hello Dolly
akismet                   inactive 5.3.2     available Anti-spam Akismet
elementor                 active   3.18.1    none     Elementor Website Builder`;

console.log("🧪 Testing table parser with sample plugin output...\n");

const parsed = parseTableOutput(samplePluginOutput);
console.log("Parsed plugins:", JSON.stringify(parsed, null, 2));

console.log("\n📊 Analysis:");
console.log(`Total plugins: ${parsed.length}`);
console.log(
  `Active plugins: ${parsed.filter(p => p.status === "active").length}`
);
console.log(
  `Plugins with updates: ${parsed.filter(p => p.update === "available").length}`
);

// Test actual WordPress list parsing
const sampleWpListOutput = `ID  Main Domain ID                               Installation Path  Owner ID         State  Hidden                                            Website URL                                         Name  Version
  226             376                                       /httpdocs        26       Working   false                           https://www.lauraifelipe.xyz                                      laulipe    6.8.1
  225             367                                       /httpdocs        26       Working   false                        https://www.lucasgarrafielo.xyz                                          aaa    6.8.1`;

console.log("\n🧪 Testing with WordPress instances list...\n");
const wpParsed = parseTableOutput(sampleWpListOutput);
console.log("Parsed WP instances:", JSON.stringify(wpParsed, null, 2));

// Find the target domain
const targetDomain = "lauraifelipe.xyz";
const targetInstance = wpParsed.find(instance =>
  instance["Website URL"]?.includes(targetDomain)
);

if (targetInstance) {
  console.log(`\n🎯 Found target instance for ${targetDomain}:`);
  console.log(`ID: ${targetInstance.ID}`);
  console.log(`State: ${targetInstance.State}`);
  console.log(`Name: ${targetInstance.Name}`);
  console.log(`Version: ${targetInstance.Version}`);
}
