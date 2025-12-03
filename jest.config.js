const { createDefaultPreset } = require("ts-jest");
require("dotenv").config({ path: ".env.test", debug: false });

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: [".*\\.integration\\.test\\.ts$"],
};
