
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.resolve(ROOT_DIR, 'docs');
const INDEX_JSON_PATH = path.resolve(ROOT_DIR, 'index.json');

const CATEGORIES = ['hooks', 'utils'] as const;

interface RegistryItem {
  name: string;
  description: string;
  category?: string;
  version: string;
  files: { type: string; path: string; target: string }[];
  dependencies: string[];
  internalDependencies: string[];
}

interface Registry {
  hooks: Record<string, RegistryItem>;
  utils: Record<string, RegistryItem>;
}

interface DocData {
  name: string;
  description: string;
  params: { name: string; type: string; desc: string }[];
  returns: { type: string; desc: string } | null;
  // Extra data from index.json
  dependencies?: string[];
  internalDependencies?: string[];
}

function parseJSDoc(content: string): Omit<DocData, 'name' | 'dependencies' | 'internalDependencies'> | null {
  // Simple regex to capture the first JSDoc block
  const jsDocMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
  if (!jsDocMatch) return null;

  const jsDocContent = jsDocMatch[1];
  const lines = jsDocContent.split('\n').map(line => line.trim().replace(/^\*\s?/, ''));

  let description = '';
  const params: DocData['params'] = [];
  let returns: DocData['returns'] = null;

  let parsingDescription = true;

  for (const line of lines) {
    if (line.startsWith('@')) {
      parsingDescription = false;

      if (line.startsWith('@param')) {
        // @param {Type} name Desc
        const match = line.match(/@param\s+\{(.*?)\}\s+(\[?[\w\.]+\]?)\s+(.*)/);
        if (match) {
          params.push({
            type: match[1],
            name: match[2],
            desc: match[3]
          });
        } else {
          const matchSimple = line.match(/@param\s+\{(.*?)\}\s+(\w+)/);
          if (matchSimple) {
            params.push({
              type: matchSimple[1],
              name: matchSimple[2],
              desc: ''
            });
          }
        }
      } else if (line.startsWith('@returns') || line.startsWith('@return')) {
        // @returns {Type} Desc
        const match = line.match(/@returns?\s+\{(.*?)\}\s+(.*)/);
        if (match) {
          returns = {
            type: match[1],
            desc: match[2]
          };
        } else {
          const matchSimple = line.match(/@returns?\s+\{(.*?)\}/);
          if (matchSimple) {
            returns = {
              type: matchSimple[1],
              desc: ''
            };
          }
        }
      }
    } else if (parsingDescription) {
      if (line.trim()) {
        description += line + '\n';
      }
    }
  }

  return {
    description: description.trim(),
    params,
    returns
  };
}

function generateMarkdown(type: 'hook' | 'util', data: DocData): string {
  const installCmd = `npx dev-tookit add ${type} ${data.name}`;

  let md = `# ${data.name}\n\n`;
  md += `${data.description}\n\n`;

  md += `## Usage\n\n`;
  md += `\`\`\`bash\n${installCmd}\n\`\`\`\n\n`;

  // Dependencies Section
  if ((data.dependencies && data.dependencies.length > 0) ||
    (data.internalDependencies && data.internalDependencies.length > 0)) {
    md += `## Dependencies\n\n`;

    if (data.dependencies && data.dependencies.length > 0) {
      md += `**NPM Dependencies**:\n`;
      data.dependencies.forEach(dep => {
        md += `- \`${dep}\`\n`;
      });
      md += `\n`;
    }

    if (data.internalDependencies && data.internalDependencies.length > 0) {
      md += `**Internal Dependencies**:\n`;
      data.internalDependencies.forEach(dep => {
        md += `- \`${dep}\`\n`;
      });
      md += `\n`;
    }
  }

  // API Section
  if (data.params.length > 0 || data.returns) {
    md += `## API\n\n`;

    if (data.params.length > 0) {
      md += `### Parameters\n\n`;
      md += `| Name | Type | Description |\n`;
      md += `| :--- | :--- | :--- |\n`;
      data.params.forEach(param => {
        // Escape pipes in type or desc
        const safeType = param.type.replace(/\|/g, '\\|');
        const safeDesc = param.desc.replace(/\|/g, '\\|');
        md += `| \`${param.name}\` | \`${safeType}\` | ${safeDesc} |\n`;
      });
      md += `\n`;
    }

    if (data.returns) {
      md += `### Returns\n\n`;
      const safeType = data.returns.type.replace(/\|/g, '\\|');
      md += `**Type**: \`${safeType}\`\n\n`;
      if (data.returns.desc) {
        md += `${data.returns.desc}\n\n`;
      }
    }
  }

  return md;
}

async function main() {
  if (!fs.existsSync(INDEX_JSON_PATH)) {
    console.error('index.json not found. Please run build:index first.');
    process.exit(1);
  }

  const indexJson: Registry = JSON.parse(fs.readFileSync(INDEX_JSON_PATH, 'utf-8'));
  const sidebar: Record<string, any[]> = {};

  for (const category of CATEGORIES) {
    const items = [];
    const registryItems = indexJson[category]; // 'hooks' or 'utils'

    if (!registryItems) continue;

    for (const [key, item] of Object.entries(registryItems)) {
      // Find the main file
      const mainFile = item.files.find(f => f.type === (category === 'hooks' ? 'hook' : 'util')) || item.files[0];
      if (!mainFile) {
        console.warn(`No file found for ${item.name}`);
        continue;
      }

      const filePath = path.resolve(ROOT_DIR, mainFile.path);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const jsDocData = parseJSDoc(content);

      if (jsDocData) {
        const docData: DocData = {
          ...jsDocData,
          name: item.name,
          // Use description from JSDoc if available (usually more detailed), fallback to index.json
          description: jsDocData.description || item.description,
          dependencies: item.dependencies,
          internalDependencies: item.internalDependencies
        };

        const mdContent = generateMarkdown(category === 'hooks' ? 'hook' : 'util', docData);

        const outputDir = path.join(DOCS_DIR, category);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(path.join(outputDir, `${item.name}.md`), mdContent);
        console.log(`Generated ${category}/${item.name}.md`);

        items.push({ text: item.name, link: `/${category}/${item.name}` });
      }
    }

    // Add Overview item
    items.unshift({ text: 'Overview', link: `/${category}/` });

    sidebar[`/${category}/`] = [
      {
        text: category.charAt(0).toUpperCase() + category.slice(1),
        items: items
      }
    ];

    // Also update the index.md for the category to list all items
    const indexContent = `# ${category.charAt(0).toUpperCase() + category.slice(1)} Overview\n\n` +
      items.slice(1).map(item => `- [${item.text}](${item.link})`).join('\n');
    fs.writeFileSync(path.join(DOCS_DIR, category, 'index.md'), indexContent);
  }

  // Write sidebar config
  const sidebarPath = path.join(DOCS_DIR, 'sidebar.json');
  fs.writeFileSync(sidebarPath, JSON.stringify(sidebar, null, 2));
  console.log(`Generated sidebar.json`);
}

main().catch(console.error);
