import {readdirSync, readFileSync} from 'fs';
import {join, relative} from 'path';

export type Fixture = {
    path: string,
};

export function findFixtures<T extends Fixture>(directory: string, baseDirectory = directory): T[] {
    const fixtures: T[] = [];

    for (const entry of readdirSync(directory, {withFileTypes: true})) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            fixtures.push(...findFixtures<T>(fullPath, baseDirectory));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            fixtures.push({
                path: relative(baseDirectory, fullPath),
                ...JSON.parse(readFileSync(fullPath, 'utf8')),
            });
        }
    }

    return fixtures;
}
