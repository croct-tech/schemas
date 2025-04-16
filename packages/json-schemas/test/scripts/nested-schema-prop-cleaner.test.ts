import {JSONSchema} from 'json-schema-typed/draft-2019-09';
import {cleanNestedSchemaProps} from '@/scripts/nested-schema-prop-cleaner';

describe('Nested schema prop cleaner', () => {
    it('should remove nested $schema props', () => {
        const schema: JSONSchema.Interface = {
            properties: {
                $schema: {
                    type: 'string',
                    description: 'The JSON schema reference for this content.',
                },
                nested: {
                    properties: {
                        other: {
                            type: 'string',
                            description: 'Some other property.',
                        },
                        $schema: {
                            type: 'string',
                            description: 'The JSON schema reference for this content.',
                        },
                        nested2: {
                            properties: {
                                other: {
                                    type: 'string',
                                    description: 'Some other property.',
                                },
                                $schema: {
                                    type: 'string',
                                    description: 'The JSON schema reference for this content.',
                                },
                            },
                        },
                    },
                },
            },
            allOf: [
                {
                    properties: {
                        other: {
                            type: 'string',
                            description: 'Some other property.',
                        },
                        $schema: {
                            type: 'string',
                            description: 'The JSON schema reference for this content.',
                        },
                    },
                },
            ],
        };

        expect(cleanNestedSchemaProps(schema)).toStrictEqual({
            properties: {
                $schema: {
                    type: 'string',
                    description: 'The JSON schema reference for this content.',
                },
                nested: {
                    properties: {
                        other: {
                            type: 'string',
                            description: 'Some other property.',
                        },
                        nested2: {
                            properties: {
                                other: {
                                    type: 'string',
                                    description: 'Some other property.',
                                },
                            },
                        },
                    },
                },
            },
            allOf: [
                {
                    properties: {
                        other: {
                            type: 'string',
                            description: 'Some other property.',
                        },
                    },
                },
            ],
        });
    });
});
