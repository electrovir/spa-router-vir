import {assert, check} from '@augment-vir/assert';
import {describe, it, itCases} from '@augment-vir/test';
import {type EmptyObject} from 'type-fest';
import {PathTree, sanitizeTreePaths} from './index.js';
import {type GenericTreePaths, type RemovePathsTypes} from './path-tree.js';
import {type FullSpaRoute, type SpaRouteByPath} from './spa-route.js';

const mockPathTree = new PathTree({
    allowBare: true,
    children: {
        app: {
            allowBare: true,
            children: {
                uploads: {
                    allowBare: false,
                    children: {
                        patients: {
                            disable: true,
                            allowBare: true,
                        },
                        files: {
                            allowBare: true,
                            children: {
                                ':file-path': {
                                    allowBare: true,
                                    children: {
                                        view: {},
                                    },
                                },
                            },
                        },
                    },
                },
                settings: {
                    allowBare: true,
                    children: {
                        disabled: {
                            allowBare: true,
                            disable: true,
                            children: {},
                        },
                    },
                },
            },
        },
        withAny: {
            anyChildren: true,
        },
        legal: {},
    },
});
describe(PathTree.name, () => {
    it('generates a paths object', () => {
        type ExpectedType = Readonly<{
            path: '';
            fullPaths: Readonly<[]>;
            PathsType: Readonly<
                | []
                | ['legal']
                | ['withAny', ...string[]]
                | ['app']
                | ['app', 'settings']
                | ['app', 'settings', 'disabled']
                | ['app', 'uploads', 'patients']
                | ['app', 'uploads', 'files']
                | ['app', 'uploads', 'files', string]
                | ['app', 'uploads', 'files', string, 'view']
            >;
            children: Readonly<{
                app: Readonly<{
                    path: 'app';
                    fullPaths: Readonly<['app']>;
                    PathsType: Readonly<
                        | ['app']
                        | ['app', 'settings']
                        | ['app', 'settings', 'disabled']
                        | ['app', 'uploads', 'patients']
                        | ['app', 'uploads', 'files']
                        | ['app', 'uploads', 'files', string]
                        | ['app', 'uploads', 'files', string, 'view']
                    >;
                    children: Readonly<{
                        settings: Readonly<{
                            path: 'settings';
                            fullPaths: Readonly<['app', 'settings']>;
                            PathsType: Readonly<
                                ['app', 'settings'] | ['app', 'settings', 'disabled']
                            >;
                            children: Readonly<{
                                disabled: Readonly<{
                                    path: 'disabled';
                                    fullPaths: Readonly<['app', 'settings', 'disabled']>;
                                    PathsType: Readonly<['app', 'settings', 'disabled']>;
                                    children: EmptyObject;
                                }>;
                            }>;
                        }>;
                        uploads: Readonly<{
                            path: 'uploads';
                            fullPaths: Readonly<['app', 'uploads']>;
                            PathsType: Readonly<
                                | ['app', 'uploads', 'patients']
                                | ['app', 'uploads', 'files']
                                | ['app', 'uploads', 'files', string]
                                | ['app', 'uploads', 'files', string, 'view']
                            >;
                            children: Readonly<{
                                files: Readonly<{
                                    fullPaths: Readonly<['app', 'uploads', 'files']>;
                                    path: 'files';
                                    PathsType: Readonly<
                                        | ['app', 'uploads', 'files']
                                        | ['app', 'uploads', 'files', string]
                                        | ['app', 'uploads', 'files', string, 'view']
                                    >;
                                    children: Readonly<{
                                        ':file-path': Readonly<{
                                            path: string;
                                            fullPaths: Readonly<
                                                ['app', 'uploads', 'files', string]
                                            >;
                                            PathsType: Readonly<
                                                | ['app', 'uploads', 'files', string]
                                                | ['app', 'uploads', 'files', string, 'view']
                                            >;
                                            children: Readonly<{
                                                view: Readonly<{
                                                    path: 'view';
                                                    fullPaths: Readonly<
                                                        ['app', 'uploads', 'files', string, 'view']
                                                    >;
                                                    PathsType: Readonly<
                                                        ['app', 'uploads', 'files', string, 'view']
                                                    >;
                                                    children: EmptyObject;
                                                }>;
                                            }>;
                                            fill<PathParam extends string = string>(
                                                pathParam: PathParam,
                                            ): Readonly<{
                                                path: PathParam;
                                                fullPaths: Readonly<
                                                    ['app', 'uploads', 'files', PathParam]
                                                >;
                                                PathsType: Readonly<
                                                    | ['app', 'uploads', 'files', PathParam]
                                                    | ['app', 'uploads', 'files', PathParam, 'view']
                                                >;
                                                children: Readonly<{
                                                    view: Readonly<{
                                                        path: 'view';
                                                        fullPaths: Readonly<
                                                            [
                                                                'app',
                                                                'uploads',
                                                                'files',
                                                                PathParam,
                                                                'view',
                                                            ]
                                                        >;
                                                        PathsType: Readonly<
                                                            [
                                                                'app',
                                                                'uploads',
                                                                'files',
                                                                PathParam,
                                                                'view',
                                                            ]
                                                        >;
                                                        children: EmptyObject;
                                                    }>;
                                                }>;
                                            }>;
                                        }>;
                                    }>;
                                }>;
                                patients: Readonly<{
                                    path: 'patients';
                                    fullPaths: Readonly<['app', 'uploads', 'patients']>;
                                    PathsType: Readonly<['app', 'uploads', 'patients']>;
                                    children: EmptyObject;
                                }>;
                            }>;
                        }>;
                    }>;
                }>;
                legal: Readonly<{
                    path: 'legal';
                    fullPaths: Readonly<['legal']>;
                    PathsType: Readonly<['legal']>;
                    children: EmptyObject;
                }>;
                withAny: Readonly<{
                    path: 'withAny';
                    fullPaths: Readonly<['withAny']>;
                    PathsType: Readonly<['withAny', ...string[]]>;
                    children: EmptyObject;
                }>;
            }>;
        }>;

        const expectedValue: RemovePathsTypes<ExpectedType> = {
            path: '',
            fullPaths: [],
            children: {
                app: {
                    path: 'app',
                    fullPaths: ['app'],
                    children: {
                        uploads: {
                            path: 'uploads',
                            fullPaths: [
                                'app',
                                'uploads',
                            ],
                            children: {
                                patients: {
                                    path: 'patients',
                                    fullPaths: [
                                        'app',
                                        'uploads',
                                        'patients',
                                    ],
                                    children: {},
                                },
                                files: {
                                    path: 'files',
                                    fullPaths: [
                                        'app',
                                        'uploads',
                                        'files',
                                    ],
                                    children: {
                                        ':file-path': {
                                            path: ':file-path',
                                            fullPaths: [
                                                'app',
                                                'uploads',
                                                'files',
                                                ':file-path',
                                            ],
                                            children: {
                                                view: {
                                                    path: 'view',
                                                    fullPaths: [
                                                        'app',
                                                        'uploads',
                                                        'files',
                                                        ':file-path',
                                                        'view',
                                                    ],
                                                    children: {},
                                                },
                                            },
                                            fill<PathParam>(pathParam: PathParam) {
                                                return {
                                                    path: pathParam,
                                                    fullPaths: [
                                                        'app',
                                                        'uploads',
                                                        'files',
                                                        pathParam,
                                                    ],
                                                    children: {
                                                        view: {
                                                            fullPaths: [
                                                                'app',
                                                                'uploads',
                                                                'files',
                                                                pathParam,
                                                                'view',
                                                            ],
                                                            path: 'view',
                                                            children: {},
                                                        },
                                                    },
                                                };
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        settings: {
                            path: 'settings',
                            fullPaths: [
                                'app',
                                'settings',
                            ],
                            children: {
                                disabled: {
                                    path: 'disabled',
                                    fullPaths: [
                                        'app',
                                        'settings',
                                        'disabled',
                                    ],
                                    children: {},
                                },
                            },
                        },
                    },
                },
                withAny: {
                    path: 'withAny',
                    fullPaths: [
                        'withAny',
                    ],
                    children: {},
                },
                legal: {
                    path: 'legal',
                    fullPaths: [
                        'legal',
                    ],
                    children: {},
                },
            },
        };

        assert.tsType(mockPathTree.paths).slowEquals<ExpectedType>();

        const testAssignment1: RemovePathsTypes<typeof mockPathTree.paths> = expectedValue;
        const testAssignment2: typeof expectedValue = {} as RemovePathsTypes<
            typeof mockPathTree.paths
        >;

        assert
            .tsType<typeof expectedValue>()
            .matches<RemovePathsTypes<typeof mockPathTree.paths>>();
        assert
            .tsType<RemovePathsTypes<typeof mockPathTree.paths>>()
            .matches<typeof expectedValue>();
        assert
            .tsType<RemovePathsTypes<typeof mockPathTree.paths>>()
            .slowEquals<typeof expectedValue>();

        assert.deepEquals(
            Object.keys(
                mockPathTree.pathsWithoutTypes.children.app.children.uploads.children.files
                    .children,
            ),
            Object.keys(expectedValue.children.app.children.uploads.children.files.children),
        );

        assert.deepEquals(mockPathTree.pathsWithoutTypes, expectedValue);

        const testAssignment3: typeof mockPathTree.pathsWithoutTypes = expectedValue;

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

    it('allows inserting a path param', () => {
        const filledPathParam =
            mockPathTree.paths.children.app.children.uploads.children.files.children[
                ':file-path'
            ].fill('my-file');

        assert
            .tsType(filledPathParam.fullPaths)
            .equals<Readonly<['app', 'uploads', 'files', 'my-file']>>();

        assert.deepEquals(
            mockPathTree.paths.children.app.children.uploads.children.files.children[
                ':file-path'
            ].fill('my-file').fullPaths,
            [
                ...mockPathTree.paths.children.app.children.uploads.children.files.fullPaths,
                'my-file',
            ],
        );
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
                        // @ts-expect-error: `allowBare` cannot be used with `anyChildren: true`
                        app: {
                            anyChildren: true,
                            allowBare: true,
                        },
                    },
                }),
            {
                matchMessage: 'cannot define both allowBare and anyChildren',
            },
        );
        assert.throws(
            () =>
                new PathTree({
                    allowBare: false,
                    children: {
                        // @ts-expect-error: `children` cannot be used with `anyChildren: true`
                        app2: {
                            anyChildren: true,
                            children: {
                                invalid: {},
                            },
                        },
                    },
                }),
            {
                matchMessage: 'cannot define anyChildren and definite children',
            },
        );
        assert.throws(
            () =>
                new PathTree({
                    allowBare: false,
                    children: {
                        app2: {
                            allowBare: false,
                            children: {},
                        },
                    },
                }),
            {
                matchMessage: 'allowBare is false but there are no definite children',
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
                    | ['app', 'uploads', 'files', string, 'view']
                    | ['app', 'settings']
                    | ['app', 'settings', 'disabled']
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
            it: 'truncates a disabled path',
            input: [
                'app',
                'settings',
                'disabled',
            ],
            expect: [
                'app',
                'settings',
            ],
        },
        {
            it: 'handles no config',
            input: [
                'legal',
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
    it('redirects paths', () => {
        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'b',
                    'hello',
                ],
                {
                    allowBare: true,
                    children: {
                        a: {
                            allowBare: true,
                            children: {},
                        },
                        b: {
                            allowBare: true,
                            redirectTo: 'a',
                            children: {
                                hello: {},
                            },
                        },
                    },
                },
            ),
            ['a'],
        );
        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'b',
                    'hello',
                ],
                {
                    allowBare: true,
                    children: {
                        a: {
                            allowBare: true,
                            children: undefined,
                        },
                        b: {
                            allowBare: true,
                            redirectTo: 'a',
                            children: {
                                hello: {},
                            },
                        },
                    },
                },
            ),
            ['a'],
        );
    });
    it('fails on invalid redirect path', () => {
        assert.throws(() =>
            sanitizeTreePaths(
                [
                    'b',
                    'hello',
                ],
                {
                    allowBare: true,
                    children: {
                        a: {
                            allowBare: true,
                            children: {},
                        },
                        b: {
                            allowBare: true,
                            redirectTo: 'q',
                            children: {
                                hello: {},
                            },
                        },
                    },
                },
            ),
        );
    });
});

describe('GenericTreePaths', () => {
    it('is compatible with concrete values', () => {
        const testAssignment: GenericTreePaths = mockPathTree.paths.children.app.children.settings;
        const testAssignment2: GenericTreePaths = mockPathTree.paths.children.app.children.uploads;
    });
});
