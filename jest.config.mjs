import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  clearMocks: true,
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
};

export default createJestConfig(customJestConfig);