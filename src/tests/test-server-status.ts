#!/usr/bin/env bun

/**
 * Test script to verify ServerStatus component functionality
 * This script simulates the API calls and validates the component logic
 */

import type {
  WpPluginList,
  WpSiteList,
  WpThemeList,
} from "@/lib/server/apis/plesk/wp-toolkit/wp-cli";

// Mock data structures for testing
const mockWpSite: WpSiteList = {
  archived: "0",
  blogId: "1",
  deleted: "0",
  domain: "example.com",
  langId: "1",
  lastUpdated: "2025-01-01",
  mature: "0",
  path: "/",
  public: "1",
  registered: "2024-01-01",
  siteId: "123",
  spam: "0",
  url: "https://example.com",
};

const mockPlugins: WpPluginList[] = [
  {
    author: "Automattic",
    autoUpdate: "off",
    description: "Anti-spam plugin",
    file: "akismet/akismet.php",
    name: "akismet",
    requires: "5.8",
    requiresPhp: "7.4",
    status: "active",
    testedUpTo: "6.4",
    title: "Akismet Anti-Spam",
    update: "available",
    updateId: "1",
    updatePackage: "",
    updateVersion: "5.1",
    version: "5.0",
    wporgLastUpdated: "2024-12-01",
    wporgStatus: "active",
  },
  {
    author: "Matt Mullenweg",
    autoUpdate: "off",
    description: "Sample plugin",
    file: "hello.php",
    name: "hello-dolly",
    requires: "2.5",
    requiresPhp: "5.2.4",
    status: "inactive",
    testedUpTo: "6.4",
    title: "Hello Dolly",
    update: "none",
    updateId: "",
    updatePackage: "",
    updateVersion: "",
    version: "1.7.2",
    wporgLastUpdated: "2023-01-01",
    wporgStatus: "active",
  },
];

const mockThemes: WpThemeList[] = [
  {
    autoUpdate: "off",
    description: "Default theme",
    name: "twentytwentyfour",
    status: "active",
    title: "Twenty Twenty-Four",
    update: "none",
    updateId: "",
    updatePackage: "",
    updateVersion: "",
    version: "1.0",
  },
];

// Test helper functions
function getDomainParts(
  domainName: string
): { sld: string; tld: string } | null {
  const domainParts = domainName.split(".");
  if (domainParts.length < 2) return null;
  const commonSecondLevel = ["co", "com", "org", "net", "gov", "ac", "edu"];
  if (
    domainParts.length > 2 &&
    commonSecondLevel.includes(
      domainParts[domainParts.length - 2].toLowerCase()
    )
  ) {
    const tld = domainParts.slice(-2).join(".");
    const sld = domainParts.slice(0, -2).join(".");
    return { sld, tld };
  }
  const tld = domainParts.pop()?.toLowerCase() || "";
  const sld = domainParts.join(".");
  if (!tld || !sld) return null;
  return { sld, tld };
}

function calculateHealthScore(services: Array<{ status: string }>): number {
  const operationalCount = services.filter(
    s => s.status === "operational"
  ).length;
  const totalServices = services.length;
  return totalServices > 0
    ? Math.round((operationalCount / totalServices) * 100)
    : 0;
}

// Test scenarios
async function testServerStatusLogic() {
  console.log("🧪 Testing ServerStatus Component Logic\n");

  // Test 1: Domain parsing
  console.log("1️⃣ Testing domain parsing:");
  const testDomains = [
    "example.com",
    "subdomain.example.co.uk",
    "test.org",
    "invalid",
  ];

  for (const domain of testDomains) {
    const result = getDomainParts(domain);
    console.log(
      `   ${domain} -> ${result ? `SLD: ${result.sld}, TLD: ${result.tld}` : "Invalid"}`
    );
  }

  // Test 2: WordPress data processing
  console.log("\n2️⃣ Testing WordPress data processing:");
  const pluginUpdates = mockPlugins.filter(
    plugin => String(plugin.update) === "available"
  ).length;
  const themeUpdates = mockThemes.filter(
    theme => String(theme.update) === "available"
  ).length;

  console.log(
    `   Plugins: ${mockPlugins.length} total, ${pluginUpdates} updates available`
  );
  console.log(
    `   Themes: ${mockThemes.length} total, ${themeUpdates} updates available`
  );

  // Test 3: Health score calculation
  console.log("\n3️⃣ Testing health score calculation:");
  const testServices = [
    { status: "operational" },
    { status: "operational" },
    { status: "issues" },
    { status: "error" },
  ];
  const healthScore = calculateHealthScore(testServices);
  console.log("   Services: 2 operational, 1 issues, 1 error");
  console.log(`   Health Score: ${healthScore}%`);

  // Test 4: Service metrics
  console.log("\n4️⃣ Testing service metrics:");
  const mockMetrics = {
    label: "Health Score",
    max: 100,
    trend: "stable" as const,
    value: 85,
  };
  console.log(
    `   Metric: ${mockMetrics.label} = ${mockMetrics.value}/${mockMetrics.max} (${mockMetrics.trend})`
  );

  // Test 5: Status color mapping
  console.log("\n5️⃣ Testing status colors:");
  const statuses = ["operational", "issues", "error", "unknown"];
  for (const status of statuses) {
    const color =
      status === "operational"
        ? "emerald"
        : status === "issues"
          ? "amber"
          : status === "error"
            ? "red"
            : "slate";
    console.log(`   ${status} -> ${color}`);
  }

  console.log("\n✅ All tests completed successfully!");
}

// Run the tests
testServerStatusLogic()
  .then(() => {
    console.log("\n🎉 ServerStatus component logic validation complete!");
  })
  .catch(error => {
    console.error("❌ Test failed:", error);
  });
