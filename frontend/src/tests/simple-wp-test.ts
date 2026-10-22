#!/usr/bin/env bun

import pleskApi from "@/lib/server/apis/plesk";

async function simpleWpTest() {
  console.log("Testing WordPress list command...");

  try {
    const result = await pleskApi.wordpress.callWp("-list");
    console.log("Success:", result.stdout);
    console.log("Error:", result.stderr);
  } catch (error) {
    console.error("Failed:", error);
  }
}

simpleWpTest();
