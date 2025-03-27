import {readdirSync, readFileSync, readFile} from 'fs';
import {join, relative, sep} from 'path';
import {JsonObject} from "@croct/json";
import Ajv2019 from "ajv/dist/2019"
import addFormats from "ajv-formats"

describe('Web events', () => {
    type Fixture = {
        path: string,
        schema: string,
        input: JsonObject,
        errors: JsonObject[],
    }

    const fixturesDirectory = join(__dirname, 'fixtures');
    const schemasDirectory = join(__dirname, '..', 'schemas');

    it.each(findFixtures(fixturesDirectory))('should validate $path', async (fixture) => {
        const schema = JSON.parse(readFileSync(join(schemasDirectory, fixture.schema), 'utf-8'));
        const ajv = new Ajv2019({
            loadSchema: (uri) => {
                const path = join(
                    schemasDirectory,
                    uri.replace('https://schema.croct.com/json/', '').replace(/\//g, sep)
                );

                return new Promise((resolve, reject) => {
                    readFile(path, 'utf8', (error, data) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(JSON.parse(data));
                        }
                    })
                })
            }
        });

        addFormats(ajv);

        const validate = await ajv.compileAsync(schema);


        console.log(validate(fixture.input));

        if (fixture.errors.length > 0) {
            console.log(validate.errors);
        }
    });


    function findFixtures(directory: string, baseDirectory =  directory): Fixture[] {
        const fixtures: Fixture[] = [];
        const entries = readdirSync(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(directory, entry.name);

            if (entry.isDirectory()) {
                fixtures.push(...findFixtures(fullPath, baseDirectory));
            } else if (entry.isFile() && entry.name.endsWith('.json')) {
                fixtures.push({
                    path: relative(baseDirectory, fullPath),
                    ...JSON.parse(readFileSync(fullPath, 'utf8'))
                });
            }
        }

        return fixtures;
    }
});


