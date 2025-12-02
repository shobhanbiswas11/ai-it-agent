const { createDefaultPreset } = require("ts-jest");
require("dotenv").config({ path: ".env.test" });

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ["**/__tests__/**/*.integration.test.ts"],
  testTimeout: 30000,
};
