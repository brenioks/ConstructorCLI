import { areSdkVersionsConfigured } from "./project_android_setup.ts";


// Test project_android_setup.ts
const testOptions = {
  "option_android_compile_sdk":"34",
  "option_android_minimum_sdk":"21",
  "option_android_support_lib":"34.0.0",
  "option_android_target_sdk":"34",
}

console.log(areSdkVersionsConfigured(testOptions));