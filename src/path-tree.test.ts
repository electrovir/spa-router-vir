import {assert, check} from '@augment-vir/assert';
import {describe, it, itCases} from '@augment-vir/test';
import {PathTree, sanitizeTreePaths} from './path-tree.js';

describe(PathTree.name, () => {
    const mockPathTree = new PathTree({
        allowBare: true,
        children: {
            app: {
                allowBare: true,
                children: {
                    uploads: {
                        allowBare: false,
                        children: {
                            files: {},
                            patients: {},
                        },
                    },
                    settings: {},
                },
            },
            legal: {},
        },
    });

    it('rejects an invalid tree', () => {
        assert.throws(
            () =>
                new PathTree({
                    allowBare: false,
                    children: {},
                }),
        );
        assert.throws(
            () =>
                new PathTree({
                    allowBare: true,
                    children: {
                        a: {
                            allowBare: false,
                            children: {},
                        },
                    },
                }),
        );
    });

    it('creates paths types', () => {
        assert
            .tsType<typeof mockPathTree.PathsType>()
            .equals<
                | []
                | ['app']
                | ['app', 'uploads', 'patients']
                | ['app', 'uploads', 'files']
                | ['app', 'settings']
                | ['legal']
            >();
    });
    it('rejects runtime access to PathsType', () => {
        assert.throws(() => mockPathTree.PathsType);
    });

    function testSanitizePaths(rawPaths: string[]) {
        const output = mockPathTree.sanitizePaths({paths: rawPaths});

        if (check.jsonEquals(rawPaths, output)) {
            return undefined;
        } else {
            return output;
        }
    }

    itCases(testSanitizePaths, [
        {
            it: 'keeps valid empty path',
            input: [],
            expect: undefined,
        },
        {
            it: 'allows valid bare path',
            input: [
                'app',
                'settings',
            ],
            expect: undefined,
        },
        {
            it: 'fixes invalid bare path',
            input: [
                'app',
                'uploads',
            ],
            expect: [
                'app',
                'uploads',
                'files',
            ],
        },
    ]);
});

describe(sanitizeTreePaths.name, () => {
    it('rejects missing children without allowBare', () => {
        assert.throws(() =>
            sanitizeTreePaths(['a'], {
                allowBare: true,
                children: {
                    a: {
                        allowBare: false,
                        children: {},
                    },
                },
            }),
        );
    });
});
