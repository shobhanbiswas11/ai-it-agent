import { config } from "dotenv";
import { defineConfig } from "vitest/config";
config({ path: ".env.test" });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.integration.test.ts"],
    testTimeout: 30000,
  },
});
