import {DefinitionJsonSchemaGenerator} from '@croct/content-model/codegen';
import type {JSONSchema} from 'json-schema-typed/draft-2019-09';

export function generateSchema(): JSONSchema.Object {
    const generator = new DefinitionJsonSchemaGenerator({
        rootDefinition: 'any',
        rootAnnotationsOnly: false,
        primitiveListItemsOnly: false,
        maximumAttributesPerStructure: 30,
        maximumUnionCardinality: 10,
        maximumStringLength: 1000,
        maximumListLength: 30,
        requiresUnionDiscriminatorPairing: false,
        attributeNamePattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        unionDiscriminatorPattern: '^[A-Za-z]+(-?[A-Za-z0-9]+)*$',
        unionReferenceOnly: true,
        nonEmptyStructure: true,
        nonConflictingConstraints: true,
        maximumAttributeDescriptionLength: 160,
        maximumAttributeLabelLength: 60,
        maximumChoiceDescriptionLength: 160,
        maximumChoiceLabelLength: 60,
        maximumChoiceValueLength: 60,
        maximumPatternLength: 100,
        maximumAttributeNameLength: 60,
        minimumAttributeNameLength: 2,
        maximumTitleLength: 60,
        maximumDescriptionLength: 160,
        maximumItemLabelLength: 60,
        maximumChoices: 20,
        maximumBooleanLabelLength: 60,
        enforceSingleDefaultChoice: false,
        features: {
            boolean: {
                label: true,
                default: true,
            },
            number: {
                integer: true,
                minimum: true,
                maximum: true,
            },
            text: {
                minimumLength: true,
                maximumLength: true,
                choices: true,
                pattern: true,
                format: {
                    url: true,
                    color: true,
                    multiline: true,
                },
            },
            list: {
                minimumLength: true,
                maximumLength: true,
                itemLabel: true,
            },
            structure: {
                title: true,
                description: true,
                attributes: {
                    label: true,
                    description: true,
                    optional: true,
                    private: true,
                    position: true,
                },
            },
            lenientMode: false,
        },
    });

    const generatedSchema = generator.generateSchema();

    return simplifyUnions({
        $id: 'https://schema.croct.com/json/content-schema.json',
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        ...generatedSchema,
        properties: {
            $schema: {
                type: 'string',
                description: 'The JSON schema reference for this content schema.',
            },
            ...generatedSchema.properties,
        },
    });
}

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

/**
 * Simplifies the union schema for better IDE support.
 *
 * @param schema The schema to simplify.
 *
 * @return The simplified schema.
 */
function simplifyUnions(schema: JSONSchema.Object): JSONSchema.Object {
    const simplifiedSchema = structuredClone(schema);

    if (isUnionSchema(simplifiedSchema)) {
        simplifiedSchema.oneOf = simplifiedSchema.allOf?.map(branch => ({$ref: branch.then.$ref})) ?? [];

        delete simplifiedSchema.properties?.type?.enum;
        delete simplifiedSchema.allOf;
    }

    for (const key of Object.keys(simplifiedSchema) as Array<keyof JSONSchema.Object>) {
        const value = simplifiedSchema[key];

        if (typeof value === 'object' && value !== null) {
            simplifiedSchema[key] = simplifyUnions(value as JSONSchema.Object);
        }
    }

    return simplifiedSchema;
}

/**
 * Checks whether the given schema is a discriminated union schema.
 *
 * @param schema The schema to check.
 *
 * @return True if the schema is a discriminated union schema, false otherwise.
 */
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
