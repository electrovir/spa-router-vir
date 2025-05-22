import {assert, check} from '@augment-vir/assert';
import {describe, it, itCases} from '@augment-vir/test';
import {PathTree, sanitizeTreePaths} from './index.js';
import {type RemovePathsTypes} from './path-tree.js';
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
            withAny: {
                anyChildren: true,
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
                withAny: {
                    path: 'withAny',
                    fullPaths: [
                        'withAny',
                    ],
                },
            },
        } as const;

        const testAssignment1: RemovePathsTypes<typeof mockPathTree.paths> = expectation;
        const testAssignment2: typeof expectation = {} as RemovePathsTypes<
            typeof mockPathTree.paths
        >;

        assert.tsType<typeof expectation>().matches<RemovePathsTypes<typeof mockPathTree.paths>>();
        assert.tsType<RemovePathsTypes<typeof mockPathTree.paths>>().matches<typeof expectation>();
        assert
            .tsType<RemovePathsTypes<typeof mockPathTree.paths>>()
            .slowEquals<typeof expectation>();

        assert.deepEquals(mockPathTree.pathsWithoutTypes, expectation);

        const testAssignment3: typeof mockPathTree.pathsWithoutTypes = expectation;

        assert.throws(() => mockPathTree.paths.children.app.PathsType);
    });

    it('works with children', () => {
        const tree = new PathTree({
            allowBare: true,
            children: {
                design: {
                    allowBare: false,
                    children: {
                        search: {
                            allowBare: true,
                            children: {
                                ':searchParams': {},
                            },
                        },
                        book: {
                            anyChildren: true,
                        },
                    },
                },
            },
        });

        assert.isDefined(tree.paths.children.design.children);
        assert.isDefined(tree.paths.children.design.children.book.fullPaths);
        assert
            .tsType<typeof tree.paths.children.design.PathsType>()
            .equals<
                Readonly<
                    | ['design', 'search']
                    | ['design', 'search', string]
                    | ['design', 'book', ...string[]]
                >
            >();

        assert
            .tsType<typeof tree.PathsType>()
            .equals<
                Readonly<
                    | []
                    | ['design', 'search']
                    | ['design', 'search', string]
                    | ['design', 'book', ...string[]]
                >
            >();

        tree.paths.children.design.fullPaths;
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

    it('requires correct types', () => {
        assert.throws(
            () =>
                new PathTree({
                    allowBare: false,
                    children: {
                        app: {
                            anyChildren: true,
                            // @ts-expect-error: `allowBare` cannot be used with `anyChildren: true`
                            allowBare: true,
                        },
                        app2: {
                            anyChildren: true,
                            // @ts-expect-error: `children` cannot be used with `anyChildren: true`
                            children: {},
                        },
                        app3: {
                            children: {},
                            // @ts-expect-error: `anyChildren` cannot be used with `children`
                            anyChildren: true,
                        },
                        // @ts-expect-error: missing `children`
                        app4: {
                            allowBare: true,
                        },
                    },
                }),
            {
                matchMessage: 'expected children',
            },
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
                    | ['withAny', ...string[]]
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
            it: 'allows bare any children path',
            input: ['withAny'],
            expect: undefined,
        },
        {
            it: 'allows 1 any children',
            input: [
                'withAny',
                'child',
            ],
            expect: undefined,
        },
        {
            it: 'allows 2 any children',
            input: [
                'withAny',
                'child',
                'child 2',
            ],
            expect: undefined,
        },
        {
            it: 'allows any children',
            input: [
                'withAny',
                'child 1',
                'child 2',
                'child 3',
                'child 4',
                'child 5',
                'child 6',
                'child 7',
                'child 8',
                'child 9',
                'child 10',
            ],
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
