import {DefinitionJsonSchemaGenerator} from '@croct/content-model/codegen';
import type {JSONSchema} from 'json-schema-typed';
import {writeFileSync} from 'fs';
import {simplifyUnions} from '@/scripts/utils';

const schemaPath = process.argv[2];

if (schemaPath === undefined) {
    console.error('Usage: generate-content-definition-schema <schema-path>');

    process.exit(1);
}

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

const schema: JSONSchema.Object = {
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    ...generatedSchema,
    properties: {
        $schema: {
            type: 'string',
        },
        ...generatedSchema.properties,
    },
};

// Improve auto-completion in IDEs
simplifyUnions(schema);

writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf-8');
