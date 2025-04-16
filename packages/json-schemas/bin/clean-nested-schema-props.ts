#!/usr/bin/env tsx

import {readFileSync, writeFileSync} from 'fs';
import {cleanNestedSchemaProps} from '@/scripts/nested-schema-prop-cleaner';

const sourcePath = process.argv[2];
const outputPath = process.argv[3];

if (sourcePath === undefined || outputPath === undefined) {
    console.error('Usage: clean-nested-schema-props <source-schema-path> <output-schema-path>');

    process.exit(1);
}

writeFileSync(
    outputPath,
    JSON.stringify(
        cleanNestedSchemaProps(JSON.parse(readFileSync(sourcePath, 'utf-8'))),
        null,
        2,
    ),
    'utf-8',
);
