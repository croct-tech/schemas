#!/usr/bin/env tsx

import {writeFileSync} from 'fs';
import {generateSchema} from '../scripts/content-schema-generator';

const schemaPath = process.argv[2];

if (schemaPath === undefined) {
    console.error('Usage: generate-content-schema <schema-path>');

    process.exit(1);
}

writeFileSync(schemaPath, JSON.stringify(generateSchema(), null, 2), 'utf-8');
