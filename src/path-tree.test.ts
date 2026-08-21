import {assert, check} from '@augment-vir/assert';
import {type EmptyObject} from '@augment-vir/common';
import {describe, it, itCases} from '@augment-vir/test';
import {PathTree, sanitizeTreePaths} from './index.js';
import {
    mapPathTree,
    type GenericTreePaths,
    type MappedPathTree,
    type RemovePathsTypes,
} from './path-tree.js';
import {mockPathTree} from './path-tree.mock.js';
import {type FullSpaRoute, type SpaRouteByPath} from './spa-route.js';

type LeafValue = Readonly<{
    label: string;
}>;

describe(PathTree.name, () => {
    it('generates a paths object', () => {
        type ExpectedType = Readonly<{
            path: '';
            fullPaths: Readonly<[]>;
            PathsType: Readonly<
                | []
                | ['legal']
                | [
                      'withAny',
                      ...string[],
                  ]
                | ['app']
                | [
                      'app',
                      'settings',
                  ]
                | [
                      'app',
                      'settings',
                      'disabled',
                  ]
                | [
                      'app',
                      'uploads',
                      'patients',
                  ]
                | [
                      'app',
                      'uploads',
                      'files',
                  ]
                | [
                      'app',
                      'uploads',
                      'files',
                      string,
                  ]
                | [
                      'app',
                      'uploads',
                      'files',
                      string,
                      'view',
                  ]
            >;
            children: Readonly<{
                app: Readonly<{
                    path: 'app';
                    fullPaths: Readonly<['app']>;
                    PathsType: Readonly<
                        | ['app']
                        | [
                              'app',
                              'settings',
                          ]
                        | [
                              'app',
                              'settings',
                              'disabled',
                          ]
                        | [
                              'app',
                              'uploads',
                              'patients',
                          ]
                        | [
                              'app',
                              'uploads',
                              'files',
                          ]
                        | [
                              'app',
                              'uploads',
                              'files',
                              string,
                          ]
                        | [
                              'app',
                              'uploads',
                              'files',
                              string,
                              'view',
                          ]
                    >;
                    children: Readonly<{
                        settings: Readonly<{
                            path: 'settings';
                            fullPaths: Readonly<
                                [
                                    'app',
                                    'settings',
                                ]
                            >;
                            PathsType: Readonly<
                                | [
                                      'app',
                                      'settings',
                                  ]
                                | [
                                      'app',
                                      'settings',
                                      'disabled',
                                  ]
                            >;
                            children: Readonly<{
                                disabled: Readonly<{
                                    path: 'disabled';
                                    fullPaths: Readonly<
                                        [
                                            'app',
                                            'settings',
                                            'disabled',
                                        ]
                                    >;
                                    PathsType: Readonly<
                                        [
                                            'app',
                                            'settings',
                                            'disabled',
                                        ]
                                    >;
                                    children: EmptyObject;
                                }>;
                            }>;
                        }>;
                        uploads: Readonly<{
                            path: 'uploads';
                            fullPaths: Readonly<
                                [
                                    'app',
                                    'uploads',
                                ]
                            >;
                            PathsType: Readonly<
                                | [
                                      'app',
                                      'uploads',
                                      'patients',
                                  ]
                                | [
                                      'app',
                                      'uploads',
                                      'files',
                                  ]
                                | [
                                      'app',
                                      'uploads',
                                      'files',
                                      string,
                                  ]
                                | [
                                      'app',
                                      'uploads',
                                      'files',
                                      string,
                                      'view',
                                  ]
                            >;
                            children: Readonly<{
                                files: Readonly<{
                                    fullPaths: Readonly<
                                        [
                                            'app',
                                            'uploads',
                                            'files',
                                        ]
                                    >;
                                    path: 'files';
                                    PathsType: Readonly<
                                        | [
                                              'app',
                                              'uploads',
                                              'files',
                                          ]
                                        | [
                                              'app',
                                              'uploads',
                                              'files',
                                              string,
                                          ]
                                        | [
                                              'app',
                                              'uploads',
                                              'files',
                                              string,
                                              'view',
                                          ]
                                    >;
                                    children: Readonly<{
                                        ':file-path': Readonly<{
                                            path: string;
                                            fullPaths: Readonly<
                                                [
                                                    'app',
                                                    'uploads',
                                                    'files',
                                                    string,
                                                ]
                                            >;
                                            PathsType: Readonly<
                                                | [
                                                      'app',
                                                      'uploads',
                                                      'files',
                                                      string,
                                                  ]
                                                | [
                                                      'app',
                                                      'uploads',
                                                      'files',
                                                      string,
                                                      'view',
                                                  ]
                                            >;
                                            children: Readonly<{
                                                view: Readonly<{
                                                    path: 'view';
                                                    fullPaths: Readonly<
                                                        [
                                                            'app',
                                                            'uploads',
                                                            'files',
                                                            string,
                                                            'view',
                                                        ]
                                                    >;
                                                    PathsType: Readonly<
                                                        [
                                                            'app',
                                                            'uploads',
                                                            'files',
                                                            string,
                                                            'view',
                                                        ]
                                                    >;
                                                    children: EmptyObject;
                                                }>;
                                            }>;
                                            fill<PathParam extends string = string>(
                                                pathParam: PathParam,
                                            ): Readonly<{
                                                path: PathParam;
                                                fullPaths: Readonly<
                                                    [
                                                        'app',
                                                        'uploads',
                                                        'files',
                                                        PathParam,
                                                    ]
                                                >;
                                                PathsType: Readonly<
                                                    | [
                                                          'app',
                                                          'uploads',
                                                          'files',
                                                          PathParam,
                                                      ]
                                                    | [
                                                          'app',
                                                          'uploads',
                                                          'files',
                                                          PathParam,
                                                          'view',
                                                      ]
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
                                    fullPaths: Readonly<
                                        [
                                            'app',
                                            'uploads',
                                            'patients',
                                        ]
                                    >;
                                    PathsType: Readonly<
                                        [
                                            'app',
                                            'uploads',
                                            'patients',
                                        ]
                                    >;
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
                    PathsType: Readonly<
                        [
                            'withAny',
                            ...string[],
                        ]
                    >;
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
        assert.tsType<typeof tree.paths.children.design.PathsType>().equals<
            Readonly<
                | [
                      'design',
                      'search',
                  ]
                | [
                      'design',
                      'search',
                      string,
                  ]
                | [
                      'design',
                      'book',
                      ...string[],
                  ]
            >
        >();

        assert.tsType<typeof tree.PathsType>().equals<
            Readonly<
                | []
                | [
                      'design',
                      'search',
                  ]
                | [
                      'design',
                      'search',
                      string,
                  ]
                | [
                      'design',
                      'book',
                      ...string[],
                  ]
            >
        >();

        tree.paths.children.design.fullPaths;
    });
    it('creates mapped path tree types', () => {
        type ExpectedType = Readonly<{
            root: LeafValue;
            children: Readonly<{
                app: Readonly<{
                    root: LeafValue;
                    children: Readonly<{
                        uploads: Readonly<{
                            children: Readonly<{
                                patients: Readonly<{
                                    root: LeafValue;
                                }>;
                                files: Readonly<{
                                    root: LeafValue;
                                    children: Readonly<{
                                        ':file-path': Readonly<{
                                            root: LeafValue;
                                            children: Readonly<{
                                                view: Readonly<{
                                                    root: LeafValue;
                                                }>;
                                            }>;
                                        }>;
                                    }>;
                                }>;
                            }>;
                        }>;
                        settings: Readonly<{
                            root: LeafValue;
                            children: Readonly<{
                                disabled: Readonly<{
                                    root: LeafValue;
                                }>;
                            }>;
                        }>;
                    }>;
                }>;
                withAny: EmptyObject;
                legal: Readonly<{
                    root: LeafValue;
                }>;
            }>;
        }>;

        const exampleInstance: MappedPathTree<
            LeafValue,
            typeof mockPathTree.tree.children.app.children.uploads
        > = {
            children: {
                files: {
                    root: {
                        label: '',
                    },
                    children: {
                        ':file-path': {
                            root: {
                                label: '',
                            },
                            children: {
                                view: {
                                    root: {
                                        label: '',
                                    },
                                },
                            },
                        },
                    },
                },
                patients: {
                    root: {
                        label: '',
                    },
                },
            },
        };

        assert.tsType<MappedPathTree<LeafValue, typeof mockPathTree.tree>>().equals<ExpectedType>();
        assert
            .tsType<
                MappedPathTree<LeafValue, typeof mockPathTree.tree.children.app.children.uploads>
            >()
            .equals<ExpectedType['children']['app']['children']['uploads']>();
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

        assert.tsType(filledPathParam.fullPaths).equals<
            Readonly<
                [
                    'app',
                    'uploads',
                    'files',
                    'my-file',
                ]
            >
        >();

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
        assert.throws(() => {
            return new PathTree({
                allowBare: false,
                children: {},
            });
        });
        assert.throws(() => {
            return new PathTree({
                allowBare: true,
                children: {
                    a: {
                        allowBare: false,
                        children: {},
                    },
                },
            });
        });
    });

    it('requires correct types', () => {
        assert.throws(
            () => {
                return new PathTree({
                    allowBare: false,
                    children: {
                        // @ts-expect-error: `allowBare` cannot be used with `anyChildren: true`
                        app: {
                            anyChildren: true,
                            allowBare: true,
                        },
                    },
                });
            },
            {
                matchMessage: 'cannot define both allowBare and anyChildren',
            },
        );
        assert.throws(
            () => {
                return new PathTree({
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
                });
            },
            {
                matchMessage: 'cannot define anyChildren and definite children',
            },
        );
        assert.throws(
            () => {
                return new PathTree({
                    allowBare: false,
                    children: {
                        app2: {
                            allowBare: false,
                            children: {},
                        },
                    },
                });
            },
            {
                matchMessage: 'allowBare is false but there are no definite children',
            },
        );
    });

    it('creates paths types', () => {
        assert.tsType<typeof mockPathTree.PathsType>().equals<
            Readonly<
                | []
                | ['app']
                | [
                      'app',
                      'uploads',
                      'patients',
                  ]
                | [
                      'app',
                      'uploads',
                      'files',
                  ]
                | [
                      'app',
                      'uploads',
                      'files',
                      string,
                  ]
                | [
                      'app',
                      'uploads',
                      'files',
                      string,
                      'view',
                  ]
                | [
                      'app',
                      'settings',
                  ]
                | [
                      'app',
                      'settings',
                      'disabled',
                  ]
                | [
                      'withAny',
                      ...string[],
                  ]
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
        assert.throws(() => {
            return sanitizeTreePaths(['a'], {
                allowBare: true,
                children: {
                    a: {
                        allowBare: false,
                        children: {},
                    },
                },
            });
        });
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
    it('redirects an exact path alias without descendants', () => {
        const tree = {
            allowBare: true,
            children: {
                current: {
                    allowBare: true,
                    redirectFrom: [
                        'legacy',
                        '/old',
                    ],
                    children: {
                        child: {},
                    },
                },
            },
        } as const;

        assert.deepEquals(sanitizeTreePaths(['legacy'], tree), ['current']);
        assert.deepEquals(sanitizeTreePaths(['old'], tree), ['current']);
    });
    it('does not match an exact path alias when more segments are present', () => {
        const tree = {
            allowBare: true,
            children: {
                current: {
                    allowBare: true,
                    redirectFrom: ['legacy'],
                    children: {
                        child: {},
                    },
                },
            },
        } as const;

        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'legacy',
                    'child',
                ],
                tree,
            ),
            [],
        );
    });
    it('redirects a wildcard path alias and forwards descendants', () => {
        const tree = {
            allowBare: true,
            children: {
                current: {
                    allowBare: true,
                    redirectFrom: ['legacy/*'],
                    children: {
                        child: {},
                    },
                },
            },
        } as const;

        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'legacy',
                    'child',
                ],
                tree,
            ),
            [
                'current',
                'child',
            ],
        );
        assert.deepEquals(sanitizeTreePaths(['legacy'], tree), []);
    });
    it('routes an exact and a wildcard alias to different siblings', () => {
        const tree = {
            allowBare: true,
            children: {
                exactTarget: {
                    allowBare: true,
                    redirectFrom: ['legacy'],
                    children: {},
                },
                wildcardTarget: {
                    allowBare: true,
                    redirectFrom: ['legacy/*'],
                    children: {
                        child: {},
                    },
                },
            },
        } as const;

        assert.deepEquals(sanitizeTreePaths(['legacy'], tree), ['exactTarget']);
        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'legacy',
                    'child',
                ],
                tree,
            ),
            [
                'wildcardTarget',
                'child',
            ],
        );
    });
    it('prefers a direct match over redirectFrom', () => {
        assert.deepEquals(
            sanitizeTreePaths(['legacy'], {
                allowBare: true,
                children: {
                    legacy: {
                        allowBare: true,
                        children: {},
                    },
                    current: {
                        allowBare: true,
                        redirectFrom: ['legacy'],
                        children: {},
                    },
                },
            }),
            ['legacy'],
        );
    });
    it('redirects from aliases on a nested child', () => {
        const tree = {
            allowBare: true,
            children: {
                app: {
                    allowBare: true,
                    children: {
                        current: {
                            allowBare: true,
                            redirectFrom: [
                                'legacy',
                                'old/*',
                            ],
                            children: {
                                child: {},
                            },
                        },
                    },
                },
            },
        } as const;

        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'app',
                    'legacy',
                ],
                tree,
            ),
            [
                'app',
                'current',
            ],
        );
        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'app',
                    'old',
                    'child',
                ],
                tree,
            ),
            [
                'app',
                'current',
                'child',
            ],
        );
        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'app',
                    'legacy',
                    'child',
                ],
                tree,
            ),
            ['app'],
        );
        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'app',
                    'old',
                ],
                tree,
            ),
            ['app'],
        );
    });
    it('routes nested exact and wildcard aliases to different siblings', () => {
        const tree = {
            allowBare: true,
            children: {
                app: {
                    allowBare: true,
                    children: {
                        exactTarget: {
                            allowBare: true,
                            redirectFrom: ['legacy'],
                            children: {},
                        },
                        wildcardTarget: {
                            allowBare: true,
                            redirectFrom: ['legacy/*'],
                            children: {
                                child: {},
                            },
                        },
                    },
                },
            },
        } as const;

        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'app',
                    'legacy',
                ],
                tree,
            ),
            [
                'app',
                'exactTarget',
            ],
        );
        assert.deepEquals(
            sanitizeTreePaths(
                [
                    'app',
                    'legacy',
                    'child',
                ],
                tree,
            ),
            [
                'app',
                'wildcardTarget',
                'child',
            ],
        );
    });
    it('fails on invalid redirect path', () => {
        assert.throws(() => {
            return sanitizeTreePaths(
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
            );
        });
    });
});

describe('GenericTreePaths', () => {
    it('is compatible with concrete values', () => {
        assert
            .tsType<typeof mockPathTree.paths.children.app.children.settings>()
            .matches<GenericTreePaths>();
        assert
            .tsType<typeof mockPathTree.paths.children.app.children.uploads>()
            .matches<GenericTreePaths>();
    });
});

describe(mapPathTree.name, () => {
    it('has proper types', () => {
        assert
            .tsType(
                mapPathTree<LeafValue>()(mockPathTree.tree.children.app.children.uploads, {
                    children: {
                        files: {
                            root: {
                                label: '',
                            },
                            children: {
                                ':file-path': {
                                    root: {
                                        label: '',
                                    },
                                    children: {
                                        view: {
                                            root: {
                                                label: '',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        patients: {
                            root: {
                                label: '',
                            },
                        },
                    },
                }),
            )
            .equals<
                MappedPathTree<LeafValue, typeof mockPathTree.tree.children.app.children.uploads>
            >();

        assert
            .tsType(
                mapPathTree<LeafValue>()(
                    mockPathTree.tree.children.app.children.uploads,
                    {} as MappedPathTree<
                        LeafValue,
                        typeof mockPathTree.tree.children.app.children.uploads
                    >,
                ),
            )
            .equals<
                MappedPathTree<LeafValue, typeof mockPathTree.tree.children.app.children.uploads>
            >();
    });
    it('returns the input directly', () => {
        const value = {
            children: {
                files: {
                    root: {
                        label: '',
                    },
                    children: {
                        ':file-path': {
                            root: {
                                label: '',
                            },
                            children: {
                                view: {
                                    root: {
                                        label: '',
                                    },
                                },
                            },
                        },
                    },
                },
                patients: {
                    root: {
                        label: '',
                    },
                },
            },
        } as const;

        assert.strictEquals(
            mapPathTree<LeafValue>()(mockPathTree.tree.children.app.children.uploads, value),
            value,
        );
    });
});
