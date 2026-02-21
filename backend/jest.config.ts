/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    // Swap out the real betterAuth module (which uses ESM-only better-auth)
    // for a lightweight CJS-compatible mock during tests.
    "^../betterAuth$": "<rootDir>/src/__mocks__/betterAuth.ts",
    "^\\.\\./betterAuth$": "<rootDir>/src/__mocks__/betterAuth.ts",
    "^./betterAuth$": "<rootDir>/src/__mocks__/betterAuth.ts",
  },
};
