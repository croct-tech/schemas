/* eslint-disable no-template-curly-in-string -- False positive */
import {JSONSchema} from 'json-schema-typed/draft-2019-09';

const dynamicStringPattern = '\\$\\{[\\s\\S]+?\\}';
const dynamicValuePattern = '^\\$\\{[\\s\\S]+\\}$';

export function transformSchema(schema: JSONSchema.Interface): JSONSchema {
    const result = transformRecursively(structuredClone(schema), true);

    if (typeof result === 'object') {
        result.$defs = {
            ...result.$defs,
            'dynamic-string': {
                type: 'string',
                description: 'A dynamic string that is evaluated at runtime.',
                pattern: dynamicStringPattern,
                examples: ['${this.value}', '${options.value}', '${this.value} ${options.value}'],
            },
            'dynamic-value': {
                type: 'string',
                description: 'A dynamic value that is evaluated at runtime.',
                pattern: dynamicValuePattern,
                examples: ['${this.value}', '${options.value}', '${this.value + options.value}'],
            },
        };
    }

    return result;
}

function transformRecursively(schema: JSONSchema, nestedOnly: boolean = false): JSONSchema {
    if (!shouldTransformSchema(schema)) {
        return schema;
    }

    switch (schema.type) {
        case 'boolean':
        case 'string':
        case 'number':
        case 'integer':
        case 'null':
            return nestedOnly ? schema : transformValue(schema);
    }

    const result: JSONSchema.Interface = {
        ...schema,
    };

    if (result.$defs !== undefined) {
        result.$defs = Object.fromEntries(
            Object.entries(result.$defs).map(([key, value]) => [key, transformRecursively(value, true)]),
        );
    }

    if (result.items !== undefined) {
        result.items = isSchemaList(result.items)
            ? result.items.map(item => transformRecursively(item))
            : transformRecursively(result.items);
    }

    if (result.additionalProperties !== undefined) {
        result.additionalProperties = transformRecursively(result.additionalProperties);
    }

    if (result.additionalProperties === false) {
        result.patternProperties = {
            ...(result.patternProperties ?? {}),
            [dynamicStringPattern]: {},
        };
    }

    if (result.propertyNames !== undefined) {
        result.propertyNames = transformRecursively(result.propertyNames);
    }

    if (result.properties !== undefined) {
        result.properties = Object.fromEntries(
            Object.entries(result.properties)
                .map(([key, value]) => [key, transformRecursively(value)]),
        );
    }

    let transformSelf = !nestedOnly;

    for (const combinator of ['allOf', 'anyOf', 'oneOf'] as const) {
        const value = result[combinator];

        if (value !== undefined && isSchemaList(value)) {
            if (value.some(shouldPreserveSchema)) {
                transformSelf = false;
            } else {
                result[combinator] = value.map(
                    subSchema => (
                        shouldTransformSchema(subSchema)
                            ? transformRecursively(subSchema, true)
                            : subSchema
                    ),
                );
            }
        }
    }

    if (result.then !== undefined && shouldTransformSchema(result.then)) {
        result.then = transformRecursively(result.then, true);
    }

    if (result.else !== undefined && shouldTransformSchema(result.else)) {
        result.else = transformRecursively(result.else, true);
    }

    if (transformSelf) {
        return transformValue(result);
    }

    return result;
}

function transformValue(schema: JSONSchema.Interface): JSONSchema.Interface {
    return {
        anyOf: [
            schema,
            {
                ...(schema.title !== undefined ? {title: schema.title} : {}),
                ...(schema.description !== undefined ? {description: schema.description} : {}),
                type: 'string',
                $ref: `#/$defs/dynamic-${schema.type === 'string' ? 'string' : 'value'}`,
            },
        ],
    };
}

function shouldTransformSchema(schema: JSONSchema): schema is JSONSchema.Interface {
    if (typeof schema !== 'object' || shouldPreserveSchema(schema)) {
        return false;
    }

    switch (schema.type) {
        case 'boolean':
        case 'string':
        case 'number':
        case 'integer':
        case 'null':
            return true;

        case 'object':
            if (schema.additionalProperties === false) {
                return true;
            }

            break;
    }

    const keywords: Array<keyof JSONSchema.Interface> = [
        '$ref',
        '$defs',
        'propertyNames',
        'items',
        'additionalProperties',
        'properties',
        'oneOf',
        'anyOf',
        'allOf',
        'then',
        'else',
    ];

    for (const keyword of keywords) {
        if (schema[keyword] === undefined) {
            continue;
        }

        switch (keyword) {
            case 'oneOf':
            case 'anyOf':
            case 'allOf':
            case 'then':
            case 'else':
                return typeof schema[keyword] !== 'boolean';

            case 'additionalProperties':
                return schema.additionalProperties !== false;

            default:
                return true;
        }
    }

    return false;
}

function shouldPreserveSchema(schema: JSONSchema.Interface): schema is JSONSchema.String {
    if (schema.const !== undefined) {
        return true;
    }

    return schema.type === 'string'
        && schema.enum === undefined
        && (schema.minLength === undefined || schema.minLength === 1)
        && schema.maxLength === undefined
        && schema.pattern === undefined;
}

function isSchemaList(schema: JSONSchema | readonly JSONSchema[]): schema is readonly JSONSchema[] {
    return Array.isArray(schema);
}
