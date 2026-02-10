const path = require("path");
const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const workspaceRoot = path.resolve(__dirname, "../..");
const config = getDefaultConfig(__dirname);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = true;

config.resolver.unstable_conditionNames = [
  "react-native",
  "require",
  "import",
  "default",
];

const libsAliases = {
  "@gds-si/shared-types": path.resolve(workspaceRoot, "libs/shared-types/src"),
  "@gds-si/shared-utils": path.resolve(workspaceRoot, "libs/shared-utils/src"),
  "@gds-si/shared-api": path.resolve(workspaceRoot, "libs/shared-api/src"),
  "@gds-si/shared-assets": path.resolve(
    workspaceRoot,
    "libs/shared-assets/src"
  ),
};

const ASSET_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
  "ttf",
  "otf",
  "woff",
  "woff2",
]);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const [alias, libPath] of Object.entries(libsAliases)) {
    if (moduleName === alias) {
      return context.resolveRequest(
        context,
        path.join(libPath, "index"),
        platform
      );
    }
    if (moduleName.startsWith(alias + "/")) {
      const subPath = moduleName.slice(alias.length + 1);
      const fullPath = path.join(libPath, subPath);

      const ext = fullPath.split(".").pop()?.toLowerCase();
      if (ext && ASSET_EXTENSIONS.has(ext)) {
        return { type: "sourceFile", filePath: fullPath };
      }

      return context.resolveRequest(context, fullPath, platform);
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

const { assetExts, sourceExts } = config.resolver;
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);
config.resolver.assetExts = assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts = [...sourceExts, "cjs", "mjs", "svg"];

module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
