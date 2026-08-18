import type { ExpoConfig, ConfigContext } from "expo/config";

// GitHub Pages serves this repo's Pages site from /<repo-name>/, so the web export needs
// its base path set accordingly. Overridable via GH_PAGES_REPO_NAME for forks/renames.
const GH_PAGES_REPO_NAME = process.env.GH_PAGES_REPO_NAME ?? "open-heart";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Open Heart",
  slug: "open-heart",
  scheme: "openheart",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  ios: {
    bundleIdentifier: "org.openheart.app",
    supportsTablet: true,
    // Matches plan.md's stated target platform (iOS 15+).
    deploymentTarget: "15.0",
    infoPlist: {
      NSFaceIDUsageDescription:
        "Open Heart uses Face ID to unlock your locally stored health records.",
      NSPhotoLibraryUsageDescription:
        "Open Heart uses your photo library to import health documents like lab reports or imaging.",
      NSCameraUsageDescription:
        "Open Heart uses your camera to photograph and import health documents.",
    },
  },
  android: {
    package: "org.openheart.app",
    adaptiveIcon: {
      backgroundColor: "#0B5D4A",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    permissions: ["USE_BIOMETRIC", "USE_FINGERPRINT"],
  },
  web: {
    output: "static",
    favicon: "./assets/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-image-picker",
      {
        cameraPermission: "Open Heart uses your camera to photograph and import health documents.",
      },
    ],
    [
      "expo-local-authentication",
      {
        faceIDPermission: "Open Heart uses Face ID to unlock your locally stored health records.",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0B5D4A",
        image: "./assets/splash-icon.png",
        imageWidth: 180,
      },
    ],
    [
      "expo-build-properties",
      {
        // Matches plan.md's stated target platform (Android 10 = API 29+).
        android: { minSdkVersion: 29 },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    // Set only so `expo export --platform web` produces asset URLs that resolve correctly
    // under https://<user>.github.io/<repo>/ (research.md #10). Native builds ignore this.
    baseUrl: `/${GH_PAGES_REPO_NAME}`,
  },
  extra: {
    eas: {
      // Links this local project to the EAS project created by `eas build` under the
      // dillguill account — EAS can't write this itself into a dynamic (.ts) config file.
      projectId: "88e7dde1-033e-4112-83e1-55f6de8a5418",
    },
  },
});
