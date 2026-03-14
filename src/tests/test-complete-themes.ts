#!/usr/bin/env bun

import { getWordPressSitesForSelectedDomain } from "@/app/(auth)/sites/wordpress-specific/actions";

async function testCompleteThemesImplementation() {
  console.log("🎨 Testing Complete Themes Implementation\n");

  try {
    console.log("1️⃣ Testing getWordPressSitesForSelectedDomain with themes...");

    const sites = await getWordPressSitesForSelectedDomain();

    console.log(`✅ Found ${sites.length} WordPress sites`);

    sites.forEach((site, index) => {
      console.log(`\nSite ${index + 1}: ${site.url}`);
      console.log(`  - Plugins: ${site.plugins?.length || 0}`);
      console.log(`  - Themes: ${site.themes?.length || 0}`);

      if (site.themes && site.themes.length > 0) {
        console.log("  - Theme details:");
        site.themes.forEach((theme) => {
          console.log(
            `    * ${theme.name} (${theme.status}) - v${theme.version}`
          );
          if (theme.title) console.log(`      Title: ${theme.title}`);
          if (theme.description)
            console.log(`      Description: ${theme.description}`);
          if (theme.update === "available" && theme.update_version)
            console.log(`      🔄 Update Available: v${theme.update_version}!`);
        });
      }

      if (
        site.updatesAvailable?.themes &&
        site.updatesAvailable.themes.length > 0
      ) {
        console.log(
          `  - Theme updates available: ${site.updatesAvailable.themes.length}`
        );
      }
    });

    console.log("\n🎉 Complete themes implementation test successful!");
  } catch (error) {
    console.error("❌ Error testing complete implementation:", error);
    throw error;
  }
}

testCompleteThemesImplementation()
  .then(() => {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  });
