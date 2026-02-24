/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    // better-auth and its plugins are ESM-only (.mjs). ts-jest runs in CJS mode
    // and cannot load them. Map the one module that pulls them all in to a
    // lightweight CJS stub.
    "^(\\.\\.?/)*betterAuth$": "<rootDir>/__tests__/__mocks__/betterAuth.ts",
  },
};
