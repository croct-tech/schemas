import {generateSchema} from '@/scripts/content-schema-generator';

describe('Content schema generator', () => {
    it('should generate the schema', () => {
        expect(generateSchema()).toStrictEqual(expect.objectContaining({
            $schema: 'https://json-schema.org/draft/2019-09/schema',
            properties: expect.objectContaining({
                $schema: {
                    type: 'string',
                    description: 'The JSON schema reference for this content.',
                },
            }),
        }));
    });
});
