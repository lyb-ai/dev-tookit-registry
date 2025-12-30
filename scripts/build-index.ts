import fs from "fs";
import path from "path";

const REGISTRY_DIR = path.join(__dirname, "..");
const HOOKS_DIR = path.join(REGISTRY_DIR, "hooks");
const UTILS_DIR = path.join(REGISTRY_DIR, "utils");
const OUTPUT_FILE = path.join(REGISTRY_DIR, "index.json");

interface ComponentFile {
  type: "hook" | "util";
  path: string;
  target: string;
}

interface Component {
  name: string;
  description: string;
  category?: string;
  files: ComponentFile[];
  dependencies: string[];
  internalDependencies: string[];
  version: string;
}

interface RegistryIndex {
  $schema: string;
  hooks: Record<string, Component>;
  utils: Record<string, Component>;
}

// Helper to extract description from JSDoc or first comment
function extractDescription(content: string): string {
  const match = content.match(/\/\*\*([\s\S]*?)\*\//) || content.match(/\/\/ (.*)/);
  if (match) {
    const desc = match[1].replace(/\*/g, "").trim();
    return desc.split("\n")[0]; // Use first line
  }
  return "";
}

// Helper to find internal dependencies (e.g. import { isBrowser } from "@/utils/isBrowser")
function findInternalDependencies(content: string): string[] {
  const deps: string[] = [];
  const regex = /from "@\/(utils|hooks)\/(\w+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    deps.push(`${match[1]}/${match[2]}`); // e.g. "utils/isBrowser"
  }
  return deps;
}

function generateIndex() {
  const index: RegistryIndex = {
    $schema: "./schema.json",
    hooks: {},
    utils: {},
  };

  // Process Hooks
  if (fs.existsSync(HOOKS_DIR)) {
    fs.readdirSync(HOOKS_DIR).forEach((file) => {
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) return;
      const name = path.basename(file, path.extname(file));
      const content = fs.readFileSync(path.join(HOOKS_DIR, file), "utf-8");

      index.hooks[name] = {
        name,
        description: extractDescription(content) || `Hook ${name}`,
        category: "Hooks", // Can be refined based on folder structure or tags
        version: "1.0.0",
        files: [
          {
            type: "hook",
            path: `hooks/${file}`,
            target: `hooks/${file}`,
          },
        ],
        dependencies: [], // TODO: Parse package.json dependencies if needed
        internalDependencies: findInternalDependencies(content),
      };
    });
  }

  // Process Utils
  if (fs.existsSync(UTILS_DIR)) {
    fs.readdirSync(UTILS_DIR).forEach((file) => {
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) return;
      const name = path.basename(file, path.extname(file));
      const content = fs.readFileSync(path.join(UTILS_DIR, file), "utf-8");

      index.utils[name] = {
        name,
        description: extractDescription(content) || `Utility ${name}`,
        version: "1.0.0",
        files: [
          {
            type: "util",
            path: `utils/${file}`,
            target: `utils/${file}`,
          },
        ],
        dependencies: [],
        internalDependencies: findInternalDependencies(content),
      };
    });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`Registry index generated at ${OUTPUT_FILE}`);
}

generateIndex();
