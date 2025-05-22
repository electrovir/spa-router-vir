import {assert, check} from '@augment-vir/assert';
import {describe, it, itCases} from '@augment-vir/test';
import {PathTree, sanitizeTreePaths} from './index.js';
import {type FullSpaRoute, type SpaRouteByPath} from './spa-route.js';

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
                            files: {
                                allowBare: true,
                                children: {
                                    ':file-path': {},
                                },
                            },
                            patients: {},
                        },
                    },
                    settings: {},
                },
            },
            legal: {},
        },
    });

    it('generates a paths object', () => {
        const expectation = {
            path: '',
            fullPaths: [],
            children: {
                app: {
                    path: 'app',
                    fullPaths: ['app'],
                    children: {
                        settings: {
                            fullPaths: [
                                'app',
                                'settings',
                            ],
                            path: 'settings',
                        },
                        uploads: {
                            path: 'uploads',
                            fullPaths: [
                                'app',
                                'uploads',
                            ],
                            children: {
                                files: {
                                    fullPaths: [
                                        'app',
                                        'uploads',
                                        'files',
                                    ],
                                    path: 'files',
                                    children: {
                                        ':file-path': {},
                                    },
                                },
                                patients: {
                                    fullPaths: [
                                        'app',
                                        'uploads',
                                        'patients',
                                    ],
                                    path: 'patients',
                                },
                            },
                        },
                    },
                },
                legal: {
                    path: 'legal',
                    fullPaths: [
                        'legal',
                    ],
                },
            },
        } as const;

        assert.deepEquals(mockPathTree.paths, expectation);

        const testAssignment: typeof mockPathTree.paths = expectation;
    });

    it('works with SpaRouteByPath', () => {
        const fakePath: SpaRouteByPath<
            typeof mockPathTree.paths.children.app.fullPaths,
            FullSpaRoute<typeof mockPathTree.PathsType>
        > = {
            paths: ['app'],
            hash: undefined,
            search: undefined,
        };

        assert.tsType(fakePath.paths[0]).equals<'app'>();
        assert.tsType(fakePath.paths[1]).equals<'uploads' | 'settings' | undefined>();
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
                Readonly<
                    | []
                    | ['app']
                    | ['app', 'uploads', 'patients']
                    | ['app', 'uploads', 'files']
                    | ['app', 'uploads', 'files', string]
                    | ['app', 'settings']
                    | ['legal']
                >
            >();
    });
    it('rejects runtime access to PathsType', () => {
        assert.throws(() => mockPathTree.PathsType);
    });

    function testSanitizePaths(rawPaths: string[]) {
        const output = mockPathTree.sanitizePaths(rawPaths);

        if (check.jsonEquals<any, any>(rawPaths, output)) {
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
        {
            it: 'allows a path param',
            input: [
                'app',
                'uploads',
                'files',
                'something',
            ],
            expect: undefined,
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
