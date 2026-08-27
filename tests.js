import { addDefaultSdkVersions, areSdkVersionsConfigured } from "./project_android_setup.ts";


// Test project_android_setup.ts
const testOptions = {
  "option_android_compile_sdk":"",
  "option_android_minimum_sdk":"",
  "option_android_support_lib":"",
  "option_android_target_sdk":"",
  "another_thing":255,
  "option_test_2":true
}

if (!areSdkVersionsConfigured(testOptions)) {
    console.log("No SDK versions found!\nAdding default SDK versions...");
    const newOptions = addDefaultSdkVersions(testOptions)
    console.log(testOptions);
    console.log(newOptions);
}

console.log("Configured");