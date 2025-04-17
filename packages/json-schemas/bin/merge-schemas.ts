#!/usr/bin/env tsx

import {mergeSchemas} from '@fastify/merge-json-schemas';
import {writeFileSync, existsSync, readFileSync} from 'fs';

const schemaPath = process.argv[2];
const otherSchemaPath = process.argv[3];
const outputPath = process.argv[4];

if (schemaPath === undefined || otherSchemaPath === undefined) {
    console.error('Usage: merge-schema <first-schema-path> <second-schema-path> <output-path>');

    process.exit(1);
}

if (!existsSync(schemaPath)) {
    console.error(`Schema file does not exist: ${schemaPath}`);

    process.exit(1);
}

if (!existsSync(otherSchemaPath)) {
    console.error(`Schema file does not exist: ${otherSchemaPath}`);

    process.exit(1);
}

const mergedSchema = mergeSchemas(
    [
        JSON.parse(readFileSync(schemaPath, 'utf-8')),
        JSON.parse(readFileSync(otherSchemaPath, 'utf-8')),
    ],
    {
        onConflict: 'first',
        resolvers: {
            $id: (keyword, values, result) => {
                // eslint-disable-next-line no-param-reassign,prefer-destructuring -- Should be modified in place
                result[keyword] = values[0];
            },
        },
        defaultResolver: (keyword, values, result) => {
            // eslint-disable-next-line no-param-reassign,prefer-destructuring -- Should be modified in place
            result[keyword] = values[0];
        },
    },
);

writeFileSync(outputPath, JSON.stringify(mergedSchema, null, 2), 'utf-8');
