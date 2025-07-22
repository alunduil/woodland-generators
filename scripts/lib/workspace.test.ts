import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface ExtensionsJson {
  recommendations: string[];
}

interface DevContainerJson {
  customizations?: {
    vscode?: {
      extensions?: string[];
    };
  };
}

// Helper function to strip comments from JSON-with-comments
function stripComments(content: string): string {
  // Remove single line comments
  content = content.replace(/\/\/.*$/gm, "");
  // Remove multi-line comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, "");
  // Clean up trailing commas before closing brackets/braces
  content = content.replace(/,(\s*[}\]])/g, "$1");
  return content;
}

describe("Workspace Configuration", () => {
  it("should have matching extensions between .vscode/extensions.json and .devcontainer/devcontainer.json", () => {
    // Read both files
    const extensionsJsonPath = join(process.cwd(), ".vscode", "extensions.json");
    const devContainerJsonPath = join(process.cwd(), ".devcontainer", "devcontainer.json");

    const extensionsJsonContent = readFileSync(extensionsJsonPath, "utf-8");
    const devContainerJsonContent = readFileSync(devContainerJsonPath, "utf-8");

    // Strip comments before parsing
    const cleanedExtensionsJson = stripComments(extensionsJsonContent);
    const cleanedDevContainerJson = stripComments(devContainerJsonContent);

    const extensionsJson: ExtensionsJson = JSON.parse(cleanedExtensionsJson);
    const devContainerJson: DevContainerJson = JSON.parse(cleanedDevContainerJson);

    // Extract extensions lists
    const extensionsRecommendations = extensionsJson.recommendations ?? [];
    const devContainerExtensions = devContainerJson.customizations?.vscode?.extensions ?? [];

    // Sort both arrays for comparison
    const sortedExtensions = [...extensionsRecommendations].sort();
    const sortedDevContainerExtensions = [...devContainerExtensions].sort();

    // Check if arrays are equal
    assert.deepEqual(
      sortedExtensions,
      sortedDevContainerExtensions,
      `Extensions mismatch between .vscode/extensions.json and .devcontainer/devcontainer.json.
      Extensions only in extensions.json: ${sortedExtensions.filter((ext) => !sortedDevContainerExtensions.includes(ext))}
      Extensions only in devcontainer.json: ${sortedDevContainerExtensions.filter((ext) => !sortedExtensions.includes(ext))}`,
    );
  });
});
