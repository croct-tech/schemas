import lenientSchema from '@croct/content-model/content/schema.json';
import {writeFileSync} from 'fs';
import {JSONSchema} from 'json-schema-typed';

const schemaPath = process.argv[2];

if (schemaPath === undefined) {
    console.error('Usage: generate-content-schema <schema-path>');

    process.exit(1);
}

const schema: JSONSchema.Object = {
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    ...(lenientSchema as unknown as JSONSchema.Object),
    properties: {
        $schema: {
            type: 'string',
            description: 'The JSON schema reference for this content schema.',
        },
        ...lenientSchema.properties,
    },
};

writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf-8');
