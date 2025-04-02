import lenientSchema from '@croct/content-model/content/schema.json';
import type {JSONSchema} from 'json-schema-typed/draft-2019-09';

export function generateSchema(): JSONSchema.Object {
    return {
        $id: 'https://schema.croct.com/json/content.json',
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        ...(lenientSchema as unknown as JSONSchema.Object),
        properties: {
            $schema: {
                type: 'string',
                description: 'The JSON schema reference for this content.',
            },
            ...lenientSchema.properties,
        },
    };
}
