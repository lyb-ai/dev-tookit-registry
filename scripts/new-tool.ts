import inquirer from 'inquirer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get current directory equivalent to __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  try {
    // 1. Interactive Flow
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select generation type:',
        choices: [
          { name: 'Hook', value: 'hook' },
          { name: 'Utils', value: 'utils' }
        ]
      },
      {
        type: 'confirm',
        name: 'useTypescript',
        message: 'Use TypeScript?',
        default: true
      },
      {
        type: 'input',
        name: 'name',
        message: 'Enter method name:',
        validate: (input) => {
          if (!input.trim()) return 'Name is required';
          if (!/^[a-zA-Z0-9_]+$/.test(input)) return 'Name must be alphanumeric';
          return true;
        }
      }
    ]);

    const { type, useTypescript, name } = answers;

    // 2. Validation Logic
    // Adjust target directory based on project structure (root/hooks or root/utils)
    // Note: User prompt mentioned src/hooks but current project uses hooks/ at root.
    // Adhering to project structure as per user rules.
    const targetDirName = type === 'hook' ? 'hooks' : 'utils';
    const targetDir = path.join(PROJECT_ROOT, targetDirName);

    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const extension = useTypescript ? 'ts' : 'js';
    const fileName = `${name}.${extension}`;
    const filePath = path.join(targetDir, fileName);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      console.error(`\nError: File already exists at ${filePath}`);
      process.exit(3);
    }

    // 3. & 4. Template Content & File Creation
    const content = generateTemplate(name, type, useTypescript);

    fs.writeFileSync(filePath, content, 'utf-8');

    // 6. Output Validation
    console.log(`\nSuccess! File created at:`);
    console.log(filePath);
    process.exit(0);

  } catch (error) {
    console.error('\nAn error occurred:', error);
    process.exit(1);
  }
}

function generateTemplate(name: string, type: string, isTs: boolean): string {
  const description = type === 'hook'
    ? `Custom hook for ${name}`
    : `Utility function ${name}`;

  if (isTs) {
    const propsName = `${name.charAt(0).toUpperCase() + name.slice(1)}Props`;
    return `type ${propsName} = {
  // TODO: Define props
};

/**
 * ${description}
 */
export const ${name} = (props: ${propsName}) => {
  // TODO: Implement ${name}
  return null;
};
`;
  } else {
    return `/**
 * ${description}
 */
export const ${name} = (params) => {
  // TODO: Implement ${name}
  return params;
};
`;
  }
}

main();
