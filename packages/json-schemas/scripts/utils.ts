/* eslint-disable no-param-reassign -- Intentional mutation in place */
// Recursively transform all allOf properties to oneOf
import {JSONSchema} from 'json-schema-typed';

type BranchSchema = JSONSchema.Object & {
    if: JSONSchema.Object,
    then: {
        $ref: string,
    },
};

type UnionSchema = JSONSchema.Object & {
    properties?: {
        type?: JSONSchema.Object & {
            enum?: string[],
        },
    },
    allOf?: BranchSchema[],
};

export function simplifyUnions(schema: JSONSchema.Object): JSONSchema.Object {
    if (isUnionSchema(schema)) {
        schema.oneOf = schema.allOf?.map(branch => ({$ref: branch.then.$ref})) ?? [];

        delete schema.properties?.type?.enum;
        delete schema.allOf;
    }

    for (const key of Object.keys(schema)) {
        const value = schema[key as keyof JSONSchema.Object];

        if (typeof value === 'object' && value !== null) {
            simplifyUnions(value as JSONSchema.Object);
        }
    }

    return schema;
}

function isUnionSchema(schema: JSONSchema.Object): schema is UnionSchema {
    return schema.properties?.type !== undefined
        && typeof schema.properties?.type === 'object'
        && schema.properties?.type?.enum !== undefined
        && schema.allOf !== undefined
        && Array.isArray(schema.allOf)
        && schema.allOf.every(
            (branch): branch is BranchSchema => branch !== undefined
                && typeof branch === 'object'
                && branch.if !== undefined
                && typeof branch.if === 'object'
                && branch.then !== undefined
                && typeof branch.then === 'object'
                && branch.then.$ref !== undefined,
        );
}
