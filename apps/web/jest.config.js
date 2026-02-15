const nextJest = require("next/jest");

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // Handle module aliases (if you use them in your project)
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/pages/(.*)$": "<rootDir>/pages/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/stores/(.*)$": "<rootDir>/stores/$1",
    "^@/types/(.*)$": "<rootDir>/types/$1",
    "^@/common/(.*)$": "<rootDir>/common/$1",
    "^@/modules/(.*)$": "<rootDir>/modules/$1",
    "^@/(.*)$": "<rootDir>/$1",
    "^@gds-si/shared-types$": "<rootDir>/../../libs/shared-types/src/index.ts",
    "^@gds-si/shared-utils$": "<rootDir>/../../libs/shared-utils/src/index.ts",
    "^@gds-si/shared-schemas$":
      "<rootDir>/../../libs/shared-schemas/src/index.ts",
    "^@gds-si/shared-schemas/(.*)$":
      "<rootDir>/../../libs/shared-schemas/src/$1",
    "^@gds-si/shared-stores$":
      "<rootDir>/../../libs/shared-stores/src/index.ts",
    "^@gds-si/shared-stores/(.*)$": "<rootDir>/../../libs/shared-stores/src/$1",
    "^@gds-si/shared-api$": "<rootDir>/../../libs/shared-api/src/index.ts",
    "^@gds-si/shared-api/(.*)$": "<rootDir>/../../libs/shared-api/src/$1",
    "^@gds-si/shared-hooks$": "<rootDir>/../../libs/shared-hooks/src/index.ts",
    "^@gds-si/shared-hooks/(.*)$": "<rootDir>/../../libs/shared-hooks/src/$1",
    "^@gds-si/shared-i18n$": "<rootDir>/../../libs/shared-i18n/src/index.ts",
    "^@gds-si/shared-i18n/(.*)$": "<rootDir>/../../libs/shared-i18n/src/$1",
  },
  testMatch: [
    "<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/**/*.(test|spec).{js,jsx,ts,tsx}",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],
  transformIgnorePatterns: ["/node_modules/(?!(nanoid|@upstash|uncrypto)/)"],
  collectCoverageFrom: [
    "components/**/*.{js,ts,jsx,tsx}",
    "lib/**/*.{js,ts,jsx,tsx}",
    "pages/**/*.{js,ts,jsx,tsx}",
    "!pages/_app.tsx",
    "!pages/_document.tsx",
    "!pages/api/**",
    "!**/*.d.ts",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
