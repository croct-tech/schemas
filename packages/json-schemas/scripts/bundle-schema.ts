import {writeFileSync, existsSync, mkdirSync} from 'fs';
import {dirname} from 'path';
import {spawnSync} from 'child_process';

const schemaPath = process.argv[2];
const outputPath = process.argv[3];

if (schemaPath === undefined || outputPath === undefined) {
    console.error('Usage: bundle-schema <schema-path> <output-path>');

    process.exit(1);
}

if (!existsSync(schemaPath)) {
    console.error(`Schema file does not exist: ${schemaPath}`);

    process.exit(1);
}

const args = [
    'bundle',
    schemaPath,
    '--resolve',
    'packages/json-schemas/schemas',
    '--without-id',
];

const data = spawnSync('jsonschema', args, {stdio: ['ignore', 'pipe', 'inherit']});

if (data.error !== undefined) {
    console.error('Error bundling schema:', data.error.message);

    process.exit(1);
}

const content = data.stdout
    .toString('utf-8')
    .replace(
        /"#\/\$defs\/https%3A~1~1schema\.croct\.com~1json~1(.+?)\.json"/g,
        (_, match) => `"#/$defs/${match.replace(/~1/g, '-')}"`,
    )
    .replace(
        /"https:\/\/schema.croct.com\/json\/(.+?)\.json"/g,
        (_, match) => `"${match.replace(/\//g, '-')}"`,
    );

if (!existsSync(dirname(outputPath))) {
    mkdirSync(dirname(outputPath), {recursive: true});
}

writeFileSync(outputPath, content, 'utf-8');
