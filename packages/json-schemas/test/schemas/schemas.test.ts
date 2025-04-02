import {readFileSync, readFile, writeFileSync} from 'fs';
import {join, sep} from 'path';
import {JsonObject} from '@croct/json';
import Ajv2019, {ErrorObject, ValidateFunction} from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
import {findFixtures} from '@/test/findFixtures';

describe('Web events', () => {
    type Fixture = {
        path: string,
        schema: string,
        allErrors?: boolean,
        input: JsonObject,
        errors: ErrorObject[],
    };

    const fixturesDirectory = join(__dirname, 'fixtures');
    const schemasDirectory = join(__dirname, '..', '..', 'schemas');

    const fix: boolean = false;

    it.each(findFixtures<Fixture>(fixturesDirectory))('should validate $path', async fixture => {
        const schema = JSON.parse(readFileSync(join(schemasDirectory, fixture.schema), 'utf-8'));
        const validate = await createValidator(schema, fixture.allErrors);

        validate(fixture.input);

        const errors = deduplicateErrors(validate.errors ?? []);

        if (fix) {
            const {path, ...updatedFixture} = fixture;

            updatedFixture.errors = errors;

            writeFileSync(join(fixturesDirectory, fixture.path), JSON.stringify(updatedFixture, null, 2));
        }

        expect(errors).toStrictEqual(fixture.errors.map(expect.objectContaining));
    });

    function createValidator(schema: JsonObject, allErrors?: boolean): Promise<ValidateFunction> {
        const ajv = new Ajv2019({
            strict: false,
            allErrors: allErrors,
            loadSchema: (uri): Promise<JsonObject> => {
                const path = join(
                    schemasDirectory,
                    uri.replace('https://schema.croct.com/json/', '').replace(/\//g, sep),
                );

                return new Promise((resolve, reject) => {
                    readFile(path, 'utf8', (error, data) => {
                        if (error !== null) {
                            reject(error);
                        } else {
                            resolve(JSON.parse(data));
                        }
                    });
                });
            },
        });

        addFormats(ajv);

        return ajv.compileAsync(schema);
    }

    function deduplicateErrors(errors: ErrorObject[]): ErrorObject[] {
        const unique: ErrorObject[] = [];

        for (const error of errors) {
            if (!unique.some(item => item.instancePath === error.instancePath && item.message === error.message)) {
                unique.push(error);
            }
        }

        return unique;
    }
});
