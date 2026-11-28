import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const { addReleaseSigning } = createRequire(import.meta.url)("./with-release-signing.js") as {
  addReleaseSigning: (gradle: string) => string;
};

// The signing parts of the android/app/build.gradle that Expo 58's prebuild
// generates.
const EXPO_GRADLE = `android {
    namespace 'com.shawared.app'
    compileSdk 36
    defaultConfig {
        applicationId 'com.shawared.app'
        versionCode 7
        versionName '1.2.3'
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
            minifyEnabled enableMinifyInReleaseBuilds
        }
    }
}
dependencies {
    implementation('com.facebook.react:react-android')
}
`;

describe("with-release-signing", () => {
  const gradle = addReleaseSigning(EXPO_GRADLE);

  it("adds a release signing config with the shared upload key, read from the environment", () => {
    expect(gradle).toContain(`    signingConfigs {
        release {
            if (System.getenv("ANDROID_UPLOAD_KEYSTORE_FILE")) {
                storeFile file(System.getenv("ANDROID_UPLOAD_KEYSTORE_FILE"))
                storeType "pkcs12"
                storePassword System.getenv("ANDROID_UPLOAD_KEYSTORE_PASSWORD")
                keyAlias "upload"
                keyPassword System.getenv("ANDROID_UPLOAD_KEYSTORE_PASSWORD")
            }
        }
        debug {`);
  });

  it("signs release builds with it when the keystore is given, and debug ones as before", () => {
    expect(gradle).toContain(`        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig System.getenv("ANDROID_UPLOAD_KEYSTORE_FILE") ? signingConfigs.release : signingConfigs.debug
            minifyEnabled enableMinifyInReleaseBuilds`);
    expect(gradle.match(/signingConfig signingConfigs\.debug/g)).toHaveLength(1);
  });

  it("preserves the app identity, build options, dependencies, and debug key", () => {
    expect(gradle).toContain(`    namespace 'com.shawared.app'
    compileSdk 36
    defaultConfig {
        applicationId 'com.shawared.app'
        versionCode 7
        versionName '1.2.3'
    }`);
    expect(gradle).toContain(`        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }`);
    expect(gradle).toContain(`dependencies {
    implementation('com.facebook.react:react-android')
}`);
  });

  it("applies once", () => {
    expect(addReleaseSigning(gradle)).toBe(gradle);
  });

  it("fails loudly when Expo's template changes", () => {
    expect(() => addReleaseSigning("android {\n}\n")).toThrow("update the plugin");
  });
});
