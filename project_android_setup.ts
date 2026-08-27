export function areSdkVersionsConfigured(androidOptions: any) {
    const sdkVersions: String[] = [
        androidOptions["option_android_compile_sdk"],
        androidOptions["option_android_minimum_sdk"],
        androidOptions["option_android_support_lib"],
        androidOptions["option_android_target_sdk"]
    ]
    
    const result = sdkVersions.every((option) => (option != ""));
    return result;
}

export function addDefaultSdkVersions(androidOptions: any) {
    // TODO: Return new Dictionary instead of modifiying input
    androidOptions["option_android_compile_sdk"] = "34";
    androidOptions["option_android_minimum_sdk"] = "21";
    androidOptions["option_android_support_lib"] = "34.0.0";
    androidOptions["option_android_target_sdk"] = "34";

    return androidOptions;
}