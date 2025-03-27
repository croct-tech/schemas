import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Adjust this to your root folder
const ROOT_DIR = './fixtures';

const PREFIX = 'https://schema.croct.io/event-tracker-service/json';

// Converts camelCase or PascalCase to kebab-case
function toKebabCase(input: string): string {
    return input
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // insert hyphen between camelCase transitions
        .replace(/[_\s]+/g, '-')                // replace underscores/spaces with hyphens
        .toLowerCase();
}

async function transformJsonFile(filePath: string): Promise<void> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(content);

        if (typeof json.schema === 'string' && json.schema.startsWith(PREFIX)) {
            const relative = json.schema.slice(PREFIX.length);
            const name = path.basename(relative);
            const kebab = toKebabCase(name);
            json.schema = kebab;
            await fs.writeFile(filePath, JSON.stringify(json, null, 2));
            console.log(`Updated schema in: ${filePath}`);
        }
    } catch (err) {
        console.error(`Failed to process ${filePath}:`, err.message);
    }
}

async function traverseDir(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await traverseDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            await transformJsonFile(fullPath);
        }
    }
}

// Start traversal
traverseDir(ROOT_DIR).catch(console.error);
