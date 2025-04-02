#!/usr/bin/env tsx

import {readFileSync, writeFileSync} from "fs";
import {transformSchema} from "../scripts/template-schema-transformer";

const schemaPath = process.argv[2];
const outputPath = process.argv[3];

if (schemaPath === undefined || outputPath === undefined) {
    console.error('Usage: process-template-schema <schema-path> <output-path>');

    process.exit(1);
}

const schema = transformSchema(JSON.parse(readFileSync(schemaPath, 'utf-8')));

writeFileSync(outputPath, JSON.stringify(schema, null, 2), 'utf-8');
