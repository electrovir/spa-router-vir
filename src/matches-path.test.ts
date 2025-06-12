import {assert} from '@augment-vir/assert';
import {type Overwrite} from '@augment-vir/common';
import {describe, it, itCases} from '@augment-vir/test';
import {matchesPaths, routeHasPaths} from './matches-path.js';
import {PathTree} from './path-tree.js';
import {type FullSpaRoute, type SpaRouteByPath} from './spa-route.js';

const mockTree = new PathTree({
    allowBare: true,
    children: {
        app: {
            allowBare: true,
            children: {
                patients: {
                    allowBare: true,
                    children: {
                        ':patient-id': {
                            allowBare: true,
                            children: {
                                intake: {},
                                summary: {},
                                billing: {},
                            },
                        },
                    },
                },
            },
        },
        design: {
            anyChildren: true,
        },
        'reset-password': {},
        'create-account': {},
        verify: {},
        legal: {},
    },
});

describe(matchesPaths.name, () => {
    it('type guards paths', () => {
        const paths: ReadonlyArray<string> = [
            'app',
            'patients',
            'some-id',
            'intake',
        ] satisfies (typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['children']['intake']['PathsType'] as ReadonlyArray<string>;

        if (
            matchesPaths(
                paths,
                mockTree.paths.children.app.children.patients.children[':patient-id'].children
                    .intake,
            )
        ) {
            type ExpectedPath =
                (typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['children']['intake']['PathsType'];

            assert.tsType(paths).equals<Readonly<[...ExpectedPath, ...string[]]>>();
        }
    });

    itCases(matchesPaths, [
        {
            it: 'matches path params',
            inputs: [
                [
                    'app',
                    'patients',
                    'some-id',
                    'intake',
                ] satisfies (typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['children']['intake']['PathsType'],
                mockTree.paths.children.app.children.patients.children[':patient-id'].children
                    .intake,
            ],
            expect: true,
        },
        {
            it: 'matches a longer path',
            inputs: [
                [
                    'app',
                    'patients',
                    'some-id',
                    'intake',
                    'some more stuff',
                ] satisfies [
                    ...(typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['children']['intake']['PathsType'],
                    ...string[],
                ],
                mockTree.paths.children.app.children.patients.children[':patient-id'].children
                    .intake,
            ],
            expect: true,
        },
        {
            it: 'does not match invalid path params',
            inputs: [
                [
                    'app',
                    'patients',
                    'intake',
                ],
                mockTree.paths.children.app.children.patients.children[':patient-id'].children
                    .intake,
            ],
            expect: false,
        },
    ]);
});

describe(routeHasPaths.name, () => {
    it('type guards the route', () => {
        type MockSearch =
            | {
                  code: ReadonlyArray<string>;
                  id: ReadonlyArray<string>;
                  type: Readonly<[string]>;
              }
            | undefined;

        type MockFullRoute = Readonly<
            FullSpaRoute<Readonly<typeof mockTree.PathsType>, MockSearch, undefined>
        >;

        const route: MockFullRoute = {
            paths: [
                'app',
                'patients',
                'some-id',
                'intake',
            ] satisfies (typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['children']['intake']['PathsType'],
            hash: undefined,
            search: undefined,
        };

        if (
            routeHasPaths(
                route,
                mockTree.paths.children.app.children.patients.children[':patient-id'].children
                    .intake,
            )
        ) {
            type ExpectedPath =
                (typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['children']['intake']['PathsType'];

            assert.tsType(route.paths).equals<ExpectedPath>();
            assert.tsType(route.hash).equals<MockFullRoute['hash']>();
            assert.tsType(route.search).equals<MockFullRoute['search']>();

            const assignmentTest: Readonly<
                Overwrite<
                    MockFullRoute,
                    Readonly<{
                        paths: ExpectedPath;
                    }>
                >
            > = route;
            const assignmentTest2: Readonly<SpaRouteByPath<ExpectedPath, MockFullRoute>> = route;

            assert.tsType(route).equals<
                Readonly<
                    Overwrite<
                        MockFullRoute,
                        Readonly<{
                            paths: ExpectedPath;
                        }>
                    >
                >
            >();
        }
    });

    it('can exactly match paths', () => {
        assert.isTrue(
            routeHasPaths(
                {
                    paths: [
                        'app',
                        'patients',
                        'some-id',
                    ] satisfies (typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['PathsType'],
                },
                mockTree.paths.children.app.children.patients.children[':patient-id'],
                {
                    exactMatch: true,
                },
            ),
        );
        assert.isTrue(
            routeHasPaths(
                {
                    paths: [
                        'app',
                        'patients',
                    ] satisfies (typeof mockTree.paths.children.app.children.patients)['PathsType'],
                },
                mockTree.paths.children.app.children.patients,
                {
                    exactMatch: true,
                },
            ),
        );
        assert.isFalse(
            routeHasPaths(
                {
                    paths: [
                        'app',
                        'patients',
                        'some-id',
                    ] satisfies (typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['PathsType'],
                },
                mockTree.paths.children.app.children.patients,
                {
                    exactMatch: true,
                },
            ),
        );
        assert.isFalse(
            routeHasPaths(
                {
                    paths: [
                        'app',
                        'patients',
                        'some-id',
                        'intake',
                    ] satisfies (typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['children']['intake']['PathsType'],
                },
                mockTree.paths.children.app.children.patients.children[':patient-id'],
                {
                    exactMatch: true,
                },
            ),
        );
    });

    it('type guards with an exact match', () => {
        const route = {
            paths: [
                'app',
                'patients',
            ] satisfies (typeof mockTree.paths.children.app.children.patients)['PathsType'] as (typeof mockTree.paths.children.app)['PathsType'],
        };

        if (
            routeHasPaths(route, mockTree.paths.children.app.children.patients, {
                exactMatch: true,
            })
        ) {
            assert.tsType(route.paths).equals<Readonly<['app', 'patients']>>();
        }
    });
    it('type guards a non-exact match', () => {
        const route = {
            paths: [
                'app',
                'patients',
            ] satisfies (typeof mockTree.paths.children.app.children.patients)['PathsType'] as (typeof mockTree.paths.children.app)['PathsType'],
        };

        if (routeHasPaths(route, mockTree.paths.children.app.children.patients)) {
            assert
                .tsType(route.paths)
                .equals<typeof mockTree.paths.children.app.children.patients.PathsType>();
        }
    });

    itCases(routeHasPaths, [
        {
            it: 'matches path params',
            inputs: [
                {
                    paths: [
                        'app',
                        'patients',
                        'some-id',
                        'intake',
                    ] satisfies (typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['children']['intake']['PathsType'],
                },
                mockTree.paths.children.app.children.patients.children[':patient-id'].children
                    .intake,
            ],
            expect: true,
        },
        {
            it: 'matches a longer path',
            inputs: [
                {
                    paths: [
                        'app',
                        'patients',
                        'some-id',
                        'intake',
                        'some more stuff',
                    ] satisfies [
                        ...(typeof mockTree.paths.children.app.children.patients.children)[':patient-id']['children']['intake']['PathsType'],
                        ...string[],
                    ],
                },
                mockTree.paths.children.app.children.patients.children[':patient-id'].children
                    .intake,
            ],
            expect: true,
        },
        {
            it: 'does not match invalid path params',
            inputs: [
                {
                    paths: [
                        'app',
                        'patients',
                        'intake',
                    ],
                },
                mockTree.paths.children.app.children.patients.children[':patient-id'].children
                    .intake,
            ],
            expect: false,
        },
    ]);
});
