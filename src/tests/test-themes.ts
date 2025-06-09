#!/usr/bin/env bun

import pleskApi from "@/lib/server/apis/plesk";

async function testWordPressThemes() {
  console.log("🎨 Testing WordPress Themes API with real Plesk data...\n");

  const testDomain = "lauraifelipe.xyz";
  const testInstanceId = "226"; // Known working instance ID for lauraifelipe.xyz
  console.log(`📍 Testing with domain: ${testDomain}`);
  console.log(`🆔 Using instance ID: ${testInstanceId}\n`);

  try {
    // Test 1: List all themes with basic format
    console.log("1️⃣ Testing basic theme list command...");
    const basicThemeResult = await pleskApi.wordpress.callWp(
      `-wp-cli -instance-id ${testInstanceId} -- theme list --format=json`
    );

    console.log("Basic Theme List Response:");
    console.log("stdout:", basicThemeResult.stdout);
    console.log("stderr:", basicThemeResult.stderr);
    console.log("exit_code:", basicThemeResult.code);

    if (basicThemeResult.stdout) {
      try {
        const themes = JSON.parse(basicThemeResult.stdout);
        console.log("\n✅ Successfully parsed themes JSON:");
        console.log(`Found ${themes.length} themes`);
        themes.forEach((theme: any, index: number) => {
          console.log(`Theme ${index + 1}:`, {
            name: theme.name,
            status: theme.status,
            update: theme.update,
            version: theme.version,
          });
        });
      } catch (parseError) {
        console.log("❌ Failed to parse themes JSON:", parseError);
      }
    }

    // Test 2: Get themes with extended fields
    console.log("\n2️⃣ Testing theme list with extended fields...");
    const extendedThemeResult = await pleskApi.wordpress.callWp(
      `-wp-cli -instance-id ${testInstanceId} -- theme list --format=json --fields=name,status,update,version,title,description,author`
    );

    console.log("Extended Theme List Response:");
    console.log("stdout:", extendedThemeResult.stdout);
    console.log("stderr:", extendedThemeResult.stderr);

    if (extendedThemeResult.stdout) {
      try {
        const extendedThemes = JSON.parse(extendedThemeResult.stdout);
        console.log("\n✅ Successfully parsed extended themes JSON:");
        console.log(`Found ${extendedThemes.length} themes with extended data`);
        extendedThemes.forEach((theme: any, index: number) => {
          console.log(`\nTheme ${index + 1}:`, {
            name: theme.name,
            title: theme.title,
            status: theme.status,
            update: theme.update,
            version: theme.version,
            description: theme.description?.substring(0, 100) + "...",
            author: theme.author,
          });
        });
      } catch (parseError) {
        console.log("❌ Failed to parse extended themes JSON:", parseError);
      }
    }

    // Test 3: Get active theme details
    console.log("\n3️⃣ Testing active theme detection...");
    const activeThemeResult = await pleskApi.wordpress.callWp(
      `-wp-cli -instance-id ${testInstanceId} -- theme list --status=active --format=json`
    );

    console.log("Active Theme Response:");
    console.log("stdout:", activeThemeResult.stdout);

    if (activeThemeResult.stdout) {
      try {
        const activeThemes = JSON.parse(activeThemeResult.stdout);
        console.log("\n✅ Active theme(s):");
        activeThemes.forEach((theme: any) => {
          console.log("Active Theme:", {
            name: theme.name,
            title: theme.title,
            status: theme.status,
            version: theme.version,
          });
        });
      } catch (parseError) {
        console.log("❌ Failed to parse active theme JSON:", parseError);
      }
    }

    // Test 4: Check for theme updates
    console.log("\n4️⃣ Testing theme update detection...");
    const updateCheckResult = await pleskApi.wordpress.callWp(
      `-wp-cli -instance-id ${testInstanceId} -- theme list --update=available --format=json`
    );

    console.log("Theme Updates Response:");
    console.log("stdout:", updateCheckResult.stdout);
    console.log("stderr:", updateCheckResult.stderr);

    if (updateCheckResult.stdout) {
      try {
        const updatableThemes = JSON.parse(updateCheckResult.stdout);
        if (updatableThemes.length > 0) {
          console.log(`\n🔄 Found ${updatableThemes.length} themes with updates available:`);
          updatableThemes.forEach((theme: any) => {
            console.log("Update Available:", {
              name: theme.name,
              current_version: theme.version,
              update_version: theme.update_version,
            });
          });
        } else {
          console.log("\n✅ No theme updates available");
        }
      } catch (parseError) {
        console.log("❌ Failed to parse theme updates JSON:", parseError);
      }
    }

    // Test 5: Test theme status command
    console.log("\n5️⃣ Testing theme status command...");
    const statusResult = await pleskApi.wordpress.callWp(
      `-wp-cli -instance-id ${testInstanceId} -- theme status --format=json`
    );

    console.log("Theme Status Response:");
    console.log("stdout:", statusResult.stdout);
    console.log("stderr:", statusResult.stderr);

    console.log("\n🎉 WordPress themes testing completed!");

  } catch (error) {
    console.error("❌ Error during themes testing:", error);
    throw error;
  }
}

// Run the test
testWordPressThemes()
  .then(() => {
    console.log("\n✅ All theme tests completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Theme tests failed:", error);
    process.exit(1);
  });
