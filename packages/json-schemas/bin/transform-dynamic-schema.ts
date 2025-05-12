#!/usr/bin/env tsx

import {readFileSync, writeFileSync} from 'fs';
import {transformSchema} from '@/scripts/dynamic-schema-transformer';

const schemaPath = process.argv[2];
const outputPath = process.argv[3];
const isTemplateSchema = process.argv[4] === '--template';

if (schemaPath === undefined || outputPath === undefined) {
    console.error('Usage: process-template-schema <schema-path> <output-path>');

    process.exit(1);
}

let schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

if (isTemplateSchema) {
    const result = transformSchema({
        $defs: schema.$defs,
    });

    if (typeof result === 'object') {
        schema.$defs = result.$defs;
        schema.properties.actions = transformSchema(schema.properties.actions);

        delete schema.properties.actions.$defs;
    }
} else {
    schema = transformSchema(schema);
}

writeFileSync(outputPath, JSON.stringify(schema, null, 2), 'utf-8');
