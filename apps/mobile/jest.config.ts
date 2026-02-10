export default {
  displayName: "mobile",
  preset: "../../jest.preset.js",
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  passWithNoTests: true,
  coverageDirectory: "../../coverage/apps/mobile",
};
