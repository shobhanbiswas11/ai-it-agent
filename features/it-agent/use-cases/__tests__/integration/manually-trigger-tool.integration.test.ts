import * as fs from "fs/promises";
import { resolve } from "path";
import { container } from "../../../container";
import { LanguageLibraryCleaner } from "../../../tools/language-library-cleaner.tool";
import { ManuallyTriggerTool } from "../../manually-trigger-tool.usecase";

describe("Manually Trigger Tools", () => {
  const tmpPath = resolve(process.cwd(), "tmp");
  const testProjectPath = resolve(tmpPath, "test-project");

  beforeEach(async () => {
    // Clean up tmp directory
    await fs.rm(tmpPath, { recursive: true, force: true });
    await fs.mkdir(tmpPath, { recursive: true });

    // Create test directory structure
    await fs.mkdir(testProjectPath, { recursive: true });
    await fs.mkdir(resolve(testProjectPath, "node_modules"), {
      recursive: true,
    });
    await fs.mkdir(resolve(testProjectPath, ".venv"), { recursive: true });
    await fs.mkdir(resolve(testProjectPath, "src"), { recursive: true });

    // Create nested project with libraries (for recursive test)
    await fs.mkdir(resolve(testProjectPath, "nested-project"), {
      recursive: true,
    });
    await fs.mkdir(resolve(testProjectPath, "nested-project", "node_modules"), {
      recursive: true,
    });

    // Add some dummy files to verify directories exist
    await fs.writeFile(
      resolve(testProjectPath, "node_modules", "package.json"),
      "{}"
    );
    await fs.writeFile(resolve(testProjectPath, ".venv", "pyvenv.cfg"), "");
    await fs.writeFile(resolve(testProjectPath, "src", "index.ts"), "");
  });

  afterEach(async () => {
    // Clean up after tests
    await fs.rm(tmpPath, { recursive: true, force: true });
  });

  it("should remove node_modules and .venv directories (non-recursive)", async () => {
    const uc = container.resolve(ManuallyTriggerTool);

    await uc.execute({
      toolName: LanguageLibraryCleaner.toolName,
      config: {
        fileSystemConfig: {
          type: "local",
        },
        config: {
          basePath: testProjectPath,
          libs: ["node_modules", ".venv"],
          recursive: false,
        },
      },
    });

    // Verify libraries were removed
    const nodeModulesExists = await fs
      .access(resolve(testProjectPath, "node_modules"))
      .then(() => true)
      .catch(() => false);
    const venvExists = await fs
      .access(resolve(testProjectPath, ".venv"))
      .then(() => true)
      .catch(() => false);

    expect(nodeModulesExists).toBe(false);
    expect(venvExists).toBe(false);

    // Verify src directory still exists
    const srcExists = await fs
      .access(resolve(testProjectPath, "src"))
      .then(() => true)
      .catch(() => false);
    expect(srcExists).toBe(true);

    // Verify nested project libraries still exist (non-recursive)
    const nestedNodeModulesExists = await fs
      .access(resolve(testProjectPath, "nested-project", "node_modules"))
      .then(() => true)
      .catch(() => false);
    expect(nestedNodeModulesExists).toBe(true);
  });

  it("should remove node_modules recursively", async () => {
    const uc = container.resolve(ManuallyTriggerTool);

    await uc.execute({
      toolName: LanguageLibraryCleaner.toolName,
      config: {
        fileSystemConfig: {
          type: "local",
        },
        config: {
          basePath: testProjectPath,
          libs: ["node_modules"],
          recursive: true,
        },
      },
    });

    // Verify top-level node_modules removed
    const nodeModulesExists = await fs
      .access(resolve(testProjectPath, "node_modules"))
      .then(() => true)
      .catch(() => false);
    expect(nodeModulesExists).toBe(false);

    // Verify nested node_modules also removed
    const nestedNodeModulesExists = await fs
      .access(resolve(testProjectPath, "nested-project", "node_modules"))
      .then(() => true)
      .catch(() => false);
    expect(nestedNodeModulesExists).toBe(false);

    // Verify .venv still exists (not in libs array)
    const venvExists = await fs
      .access(resolve(testProjectPath, ".venv"))
      .then(() => true)
      .catch(() => false);
    expect(venvExists).toBe(true);
  });

  it("should handle empty directory gracefully", async () => {
    const emptyPath = resolve(tmpPath, "empty-project");
    await fs.mkdir(emptyPath, { recursive: true });

    const uc = container.resolve(ManuallyTriggerTool);

    await expect(
      uc.execute({
        toolName: LanguageLibraryCleaner.toolName,
        config: {
          fileSystemConfig: {
            type: "local",
          },
          config: {
            basePath: emptyPath,
            libs: ["node_modules", ".venv"],
            recursive: true,
          },
        },
      })
    ).resolves.not.toThrow();
  });
});
