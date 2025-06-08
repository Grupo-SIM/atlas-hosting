#!/usr/bin/env bun

import pleskApi from "@/lib/server/apis/plesk";

async function testWordPressPlugins() {
  console.log("🧪 Testing WordPress Plugins API with real Plesk data...\n");
  
  const testDomain = "lauraifelipe.xyz";
  console.log(`📍 Testing with domain: ${testDomain}\n`);

  try {
    // First, let's list all WordPress instances to find one for our domain
    console.log("1️⃣ Getting WordPress instances...");
    const wpListResult = await pleskApi.wordpress.callWp("-list");
    console.log("WP List Result:", JSON.stringify(wpListResult, null, 2));
    
    // Parse the table format response
    if (wpListResult.stdout) {
      console.log("Raw stdout:", wpListResult.stdout);
      
      // Let's try a different approach - list instances with JSON format
      console.log("\n1️⃣ b) Trying to get instance info with JSON format...");
      const wpInfoResult = await pleskApi.wordpress.callWp("-info -format=json");
      console.log("WP Info Result:", JSON.stringify(wpInfoResult, null, 2));
      
      // For now, let's manually parse the table or use a known instance ID
      // In practice, we would parse the table format from -list command
      const testInstanceId = "1"; // We'll use a test instance ID
      console.log(`📋 Using test instance ID: ${testInstanceId}`);
      
      // Test plugin list command with corrected syntax
      console.log("\n2️⃣ Testing plugin list command...");
      const pluginListResult = await pleskApi.wordpress.callWp(
        `-wp-cli -instance-id ${testInstanceId} -- plugin list -format=json`
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
            console.log(`Active plugins: ${plugins.filter((p: any) => p.status === 'active').length}`);
            console.log(`Plugins with updates: ${plugins.filter((p: any) => p.update === 'available').length}`);
            
            // Show first few plugins as examples
            console.log("\n🔍 Sample plugins:");
            plugins.slice(0, 3).forEach((plugin: any, index: number) => {
              console.log(`${index + 1}. ${plugin.name} (${plugin.status}) - v${plugin.version}`);
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
        `-wp-cli -instance-id ${testInstanceId} -- core check-update -format=json`
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
        `-wp-cli -instance-id ${testInstanceId} -- theme list -format=json`
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
            const activeTheme = themes.find((t: any) => t.status === 'active');
            if (activeTheme) {
              console.log(`Active theme: ${activeTheme.name} (v${activeTheme.version})`);
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
testWordPressPlugins().then(() => {
  console.log("\n✅ Test completed");
}).catch((error) => {
  console.error("❌ Test failed:", error);
});
            
            console.log("\n📝 Sample plugin structure:");
            console.log(JSON.stringify(plugins[0], null, 2));
          }
        }
        
        // Test plugin status command for a specific plugin
        console.log("\n3️⃣ Testing plugin status commands...");
        const statusResult = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${testInstance.instanceId} -- plugin status -format=json`
        );
        
        console.log("Plugin Status Response:");
        console.log("stdout:", statusResult.stdout);
        console.log("stderr:", statusResult.stderr);
        
        // Test core update check
        console.log("\n4️⃣ Testing core update check...");
        const coreUpdateResult = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${testInstance.instanceId} -- core check-update -format=json`
        );
        
        console.log("Core Update Check Response:");
        console.log("stdout:", coreUpdateResult.stdout);
        console.log("stderr:", coreUpdateResult.stderr);
        
        if (coreUpdateResult.stdout) {
          try {
            const coreUpdates = JSON.parse(coreUpdateResult.stdout);
            console.log("📈 Core updates structure:");
            console.log(JSON.stringify(coreUpdates, null, 2));
          } catch (e) {
            console.log("Core is up to date (no JSON response)");
          }
        }
        
        // Test user list
        console.log("\n5️⃣ Testing user list...");
        const userListResult = await pleskApi.wordpress.callWp(
          `--wp-cli -instance-id ${testInstance.instanceId} -- user list -format=json`
        );
        
        console.log("User List Response:");
        console.log("stdout:", userListResult.stdout);
        console.log("stderr:", userListResult.stderr);
        
        if (userListResult.stdout) {
          const users = JSON.parse(userListResult.stdout);
          console.log("👥 Users structure:");
          console.log(JSON.stringify(users, null, 2));
        }
        
      } else {
        console.log(`❌ No WordPress instances found for domain ${testDomain}`);
        console.log("Available domains in instances:");
        wpInstances.forEach((instance: any, index: number) => {
          console.log(`  ${index + 1}. ${instance.domain} (ID: ${instance.instanceId})`);
        });
      }
    }
    
  } catch (error) {
    console.error("❌ Error testing WordPress plugins:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  }
}

// Run the test
testWordPressPlugins().then(() => {
  console.log("\n✅ Test completed!");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
