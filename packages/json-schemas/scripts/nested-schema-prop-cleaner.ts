import {JSONSchema} from 'json-schema-typed/draft-2019-09';

export function cleanNestedSchemaProps(schema: JSONSchema.Interface, root = true): JSONSchema {
    const result = {...schema};

    if (!root && result.properties?.$schema !== undefined) {
        delete result.properties.$schema;
    }

    return Object.fromEntries(
        Object.entries(result).map(
            ([key, value]) => {
                if (Array.isArray(value)) {
                    return [key, value.map(item => (isSchema(item) ? cleanNestedSchemaProps(item, false) : item))];
                }

                if (isSchema(value)) {
                    return [key, cleanNestedSchemaProps(value, false)];
                }

                return [key, value];
            },
        ),
    );
}

function isSchema(schema: JSONSchema): schema is JSONSchema.Interface {
    return typeof schema === 'object' && schema !== null && !Array.isArray(schema);
}
