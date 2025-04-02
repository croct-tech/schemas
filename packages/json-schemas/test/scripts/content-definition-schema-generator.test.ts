import {generateSchema} from '@/scripts/content-definition-schema-generator';

describe('Content definition schema generator', () => {
    it('should generate the schema', () => {
        expect(generateSchema()).toStrictEqual(expect.objectContaining({
            $schema: 'https://json-schema.org/draft/2019-09/schema',
            properties: expect.objectContaining({
                $schema: {
                    type: 'string',
                    description: 'The JSON schema reference for this content schema.',
                },
            }),
        }));
    });
});
