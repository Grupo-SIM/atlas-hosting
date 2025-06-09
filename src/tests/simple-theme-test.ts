#!/usr/bin/env bun

import pleskApi from "@/lib/server/apis/plesk";

console.log("🎨 Simple WordPress Themes Test\n");

async function simpleThemeTest() {
  try {
    const result = await pleskApi.wordpress.callWp(
      `-wp-cli -instance-id 226 -- theme list --format=json`
    );
    
    console.log("Theme List Response:");
    console.log("stdout:", result.stdout);
    console.log("stderr:", result.stderr);
    console.log("exit_code:", result.code);
    
    if (result.stdout) {
      const themes = JSON.parse(result.stdout);
      console.log(`\n✅ Found ${themes.length} themes:`);
      themes.forEach((theme: any) => {
        console.log(`- ${theme.name} (${theme.status})`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

simpleThemeTest();
