#!/usr/bin/env bun

import pleskApi from "@/lib/server/apis/plesk";

async function testWordPressPlugins() {
  console.log("🧪 Testing WordPress Plugins API with real Plesk data...\n");

  const testDomain = "lauraifelipe.xyz";
  console.log(`📍 Testing with domain: ${testDomain}\n`);

  try {
    // First, let's list all WordPress instances
    console.log("1️⃣ Getting WordPress instances list...");
    const wpListResult = await pleskApi.wordpress.callWp("-list");
    console.log("WP List Result:", JSON.stringify(wpListResult, null, 2));

    if (wpListResult.stdout) {
      console.log("Raw stdout:", wpListResult.stdout);

      // Found our target domain! Use instance 226 for lauraifelipe.xyz
      const testInstanceId = "226"; // This is the working lauraifelipe.xyz instance
      console.log(`\n📋 Using lauraifelipe.xyz instance ID: ${testInstanceId}`);

      // Test plugin list command with corrected syntax
      console.log("\n2️⃣ Testing plugin list command...");
      const pluginListResult = await pleskApi.wordpress.callWp(
        `-wp-cli -instance-id ${testInstanceId} -- plugin list --format=json`
      );

      console.log("Plugin List Raw Response:");
      console.log("stdout:", pluginListResult.stdout);
      console.log("stderr:", pluginListResult.stderr);

      if (pluginListResult.stdout) {
        try {
          const plugins = JSON.parse(pluginListResult.stdout);
          console.log("\n📦 Plugins structure:");
          console.log(JSON.stringify(plugins, null, 2));

          if (Array.isArray(plugins) && plugins.length > 0) {
            console.log("\n📊 Plugin analysis:");
            console.log(`Total plugins: ${plugins.length}`);

            const activePlugins = plugins.filter(
              (p: any) => p.status === "active"
            );
            const pluginsWithUpdates = plugins.filter(
              (p: any) => p.update === "available"
            );

            console.log(`Active plugins: ${activePlugins.length}`);
            console.log(`Plugins with updates: ${pluginsWithUpdates.length}`);

            // Show first few plugins as examples
            console.log("\n🔍 Sample plugins:");
            plugins.slice(0, 3).forEach((plugin: any, index: number) => {
              console.log(
                `${index + 1}. ${plugin.name} (${plugin.status}) - v${plugin.version}`
              );
              if (plugin.update === "available") {
                console.log(`   📦 Update available: ${plugin.update_version}`);
              }
            });
          }
        } catch (parseError) {
          console.error("Failed to parse plugin list JSON:", parseError);
          console.log("Raw response was:", pluginListResult.stdout);
        }
      }

      // Test WordPress core status
      console.log("\n3️⃣ Testing WordPress core status...");
      const statusResult = await pleskApi.wordpress.callWp(
        `-wp-cli -instance-id ${testInstanceId} -- core check-update --format=json`
      );

      console.log("Core Status Raw Response:");
      console.log("stdout:", statusResult.stdout);
      console.log("stderr:", statusResult.stderr);

      if (statusResult.stdout) {
        try {
          const coreStatus = JSON.parse(statusResult.stdout);
          console.log("\n🔧 WordPress Core Status:");
          console.log(JSON.stringify(coreStatus, null, 2));
        } catch (parseError) {
          console.error("Failed to parse core status JSON:", parseError);
        }
      }

      // Test theme list
      console.log("\n4️⃣ Testing theme list command...");
      const themeListResult = await pleskApi.wordpress.callWp(
        `-wp-cli -instance-id ${testInstanceId} -- theme list --format=json`
      );

      console.log("Theme List Raw Response:");
      console.log("stdout:", themeListResult.stdout);
      console.log("stderr:", themeListResult.stderr);

      if (themeListResult.stdout) {
        try {
          const themes = JSON.parse(themeListResult.stdout);
          console.log("\n🎨 Themes structure:");
          console.log(JSON.stringify(themes, null, 2));

          if (Array.isArray(themes) && themes.length > 0) {
            console.log(`\nTotal themes: ${themes.length}`);
            const activeTheme = themes.find((t: any) => t.status === "active");
            if (activeTheme) {
              console.log(
                `Active theme: ${activeTheme.name} (v${activeTheme.version})`
              );
            }
          }
        } catch (parseError) {
          console.error("Failed to parse theme list JSON:", parseError);
        }
      }
    } else {
      console.log("❌ No WordPress instances found or empty response");
    }
  } catch (error: any) {
    console.error("❌ Error testing WordPress plugins:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    console.error("Error stack:", error.stack);
  }
}

// Run the test
testWordPressPlugins()
  .then(() => {
    console.log("\n✅ Test completed");
  })
  .catch(error => {
    console.error("❌ Test failed:", error);
  });
