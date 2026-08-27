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
