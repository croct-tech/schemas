import {writeFileSync, existsSync, mkdirSync, readFileSync} from 'fs';
import {dirname, join} from 'path';
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
    join(import.meta.dirname, '..', 'schemas'),
    '--without-id',
];

const data = spawnSync('jsonschema', args, {stdio: ['ignore', 'pipe', 'inherit']});

if (data.error !== undefined || data.status !== 0) {
    if (data.error !== undefined) {
        console.error('Error bundling schema:', data.error.message);
    }

    process.exit(1);
}

const content = data.stdout
    .toString('utf-8')
    .replace(
        /#\/\$defs\/https%3A~1~1schema\.croct\.com~1json~1(.+?)\.json/g,
        (_, match) => `#/$defs/${match.replace(/~1/g, '-')}`,
    )
    .replace(
        /"https:\/\/schema.croct.com\/json\/(.+?)\.json"/g,
        (_, match) => `"${match.replace(/\//g, '-')}"`,
    );

const bundledSchema = {
    $id: JSON.parse(readFileSync(schemaPath, 'utf-8')).$id,
    ...JSON.parse(content),
};

const parentDirectory = dirname(outputPath);

if (parentDirectory !== '.' && !existsSync(parentDirectory)) {
    mkdirSync(parentDirectory, {recursive: true});
}

writeFileSync(outputPath, JSON.stringify(bundledSchema, null, 2), 'utf-8');
