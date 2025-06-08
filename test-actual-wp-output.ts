#!/usr/bin/env bun

import pleskApi from "@/lib/server/apis/plesk";

async function testPluginOutput() {
  console.log("🧪 Testing actual wp-cli plugin output format...\n");
  
  try {
    // Test with instance 226 which is lauraifelipe.xyz and Working
    const instanceId = "226";
    console.log(`📋 Testing with instance ID: ${instanceId} (lauraifelipe.xyz)`);
    
    // Test plugin list command to see actual format
    console.log("\n2️⃣ Testing plugin list command...");
    const pluginListResult = await pleskApi.wordpress.callWp(
      `-wp-cli -instance-id ${instanceId} -- plugin list`
    );
    
    console.log("Plugin List Raw Response:");
    console.log("stdout:");
    console.log(pluginListResult.stdout);
    console.log("\nstderr:");
    console.log(pluginListResult.stderr);
    
    // Test theme list command
    console.log("\n3️⃣ Testing theme list command...");
    const themeListResult = await pleskApi.wordpress.callWp(
      `-wp-cli -instance-id ${instanceId} -- theme list`
    );
    
    console.log("Theme List Raw Response:");
    console.log("stdout:");
    console.log(themeListResult.stdout);
    console.log("\nstderr:");
    console.log(themeListResult.stderr);
    
    // Test core check-update
    console.log("\n4️⃣ Testing core check-update...");
    const coreUpdateResult = await pleskApi.wordpress.callWp(
      `-wp-cli -instance-id ${instanceId} -- core check-update`
    );
    
    console.log("Core Update Raw Response:");
    console.log("stdout:");
    console.log(coreUpdateResult.stdout);
    console.log("\nstderr:");
    console.log(coreUpdateResult.stderr);

  } catch (error: any) {
    console.error("❌ Error testing plugin output:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    console.error("Error stack:", error.stack);
  }
}

// Run the test
testPluginOutput()
  .then(() => {
    console.log("\n✅ Test completed");
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
  });
