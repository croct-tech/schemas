/* eslint-disable no-template-curly-in-string -- False positive */
import {JSONSchema} from 'json-schema-typed/draft-2019-09';
import {writeFileSync} from 'fs';
import {join} from 'path';
import {transformSchema} from '@/scripts/template-schema-transformer';
import {findFixtures} from '@/test/findFixtures';

describe('Template schema transformer', () => {
    type Fixture = {
        path: string,
        input: JSONSchema.Interface,
        expected: JSONSchema.Interface,
    };

    const fixturesDirectory = join(__dirname, 'fixtures');

    const addedReferences: Record<string, JSONSchema.Interface> = {
        'dynamic-string': {
            type: 'string',
            description: 'A dynamic string that is evaluated at runtime.',
            pattern: '\\$\\{.+?\\}',
            examples: [
                '${this.value}',
                '${options.value}',
                '${this.value} ${options.value}',
            ],
        },
        'dynamic-value': {
            type: 'string',
            description: 'A dynamic value that is evaluated at runtime.',
            pattern: '^\\$\\{.+\\}$',
            examples: [
                '${this.value}',
                '${options.value}',
                '${this.value + options.value}',
            ],
        },
    };

    const update = false;
    const filter: string|null = null;

    const fixtures = findFixtures<Fixture>(fixturesDirectory);
    const filteredFixtures = filter === null
        ? fixtures
        : fixtures.filter(fixture => fixture.path.includes(filter));

    it.each(filteredFixtures)('should correctly transform $path', scenario => {
        const result = transformSchema(scenario.input) as JSONSchema.Interface;
        const expected = {
            ...scenario.expected,
            $defs: {
                ...scenario.expected.$defs,
                ...addedReferences,
            },
        };

        if (update) {
            const {path, ...updatedScenario} = structuredClone(scenario);

            updatedScenario.expected = structuredClone(result);

            for (const key of Object.keys(addedReferences)) {
                if (updatedScenario.expected.$defs?.[key] !== undefined) {
                    delete updatedScenario.expected.$defs[key];
                }
            }

            writeFileSync(join(fixturesDirectory, scenario.path), JSON.stringify(updatedScenario, null, 2));
        }

        // toStrictEqual is not used here because it does not work with structuredClone
        // https://github.com/jestjs/jest/issues/14011
        expect(result).toEqual(expected);
    });
});
