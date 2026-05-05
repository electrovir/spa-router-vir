import {assert, waitUntil} from '@augment-vir/assert';
import {type MaybePromise} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {buildUrl, parseUrl, SearchParamStrategy} from 'url-vir';
import {
    type FullSpaRoute,
    type SpaRoute,
    type ValidHashBase,
    type ValidPathsBase,
    type ValidSearchBase,
} from './spa-route.js';
import {type SpaRouterParams} from './spa-router-params.js';
import {SpaRouter} from './spa-router.js';
import {type MockValidPaths, sanitizeMockPaths} from './spa-router.mock.js';

describe(SpaRouter.name, () => {
    function testRouter<
        ValidPaths extends ValidPathsBase = MockValidPaths,
        ValidSearch extends ValidSearchBase | undefined = undefined,
        ValidHash extends ValidHashBase | undefined = undefined,
    >(
        init: Partial<SpaRouterParams<ValidPaths, ValidSearch, ValidHash>>,
        callback: (
            mockRouter: SpaRouter<ValidPaths, ValidSearch, ValidHash>,
            hrefBefore: string,
        ) => MaybePromise<void>,
    ) {
        return async () => {
            const hrefBefore = window.location.href;
            const mockRouter = new SpaRouter<ValidPaths, ValidSearch, ValidHash>({
                sanitizeRoute(rawRoute) {
                    return {
                        paths: sanitizeMockPaths(rawRoute) as ReadonlyArray<string> as ValidPaths,
                        search: undefined as ValidSearch,
                        hash: undefined as ValidHash,
                    };
                },
                ...init,
            });

            try {
                await callback(mockRouter, hrefBefore);
            } finally {
                mockRouter.destroy();
            }
        };
    }

    it('inserts a base path', () => {
        let sanitizerCalled = false;
        window.history.replaceState(undefined, '', '/something');
        const router = new SpaRouter({
            sanitizeRoute(rawRoute) {
                sanitizerCalled = true;
                assert.notStrictEquals(rawRoute.paths[0], 'something');
                return rawRoute;
            },
            basePath: 'something',
        });

        assert.isTrue(sanitizerCalled);

        assert.strictEquals(
            buildUrl(
                router.createRouteUrl({
                    paths: ['path1'],
                }).url,
                {search: {}},
                {searchParamStrategy: SearchParamStrategy.Clear},
            ).pathname,
            '/something/path1',
        );
    });

    it(
        'sanitizes the current route on construction',
        testRouter({}, (mockRouter, hrefBefore) => {
            const hrefAfter = window.location.href;

            assert.notStrictEquals(hrefBefore, hrefAfter);
            assert.strictEquals(parseUrl(window.location.href).pathname, '/home');
            assert.deepEquals(mockRouter.readCurrentRoute(), {
                hash: undefined,
                paths: ['home'],
                search: undefined,
            });
        }),
    );

    it(
        'sanitizes a route',
        testRouter({}, (mockRouter) => {
            assert.deepEquals(
                mockRouter.sanitizeRoute({
                    paths: [
                        'this is not',
                        'a',
                        'valid path',
                    ],
                    search: {
                        what: ['some value'],
                    },
                    hash: 'what-is-this',
                }),
                {
                    hash: undefined,
                    paths: ['home'],
                    search: undefined,
                },
            );
        }),
    );

    it(
        'creates route URLs',
        testRouter({}, (mockRouter) => {
            const sanitizedInvalidUrl = mockRouter.createRouteUrl({
                paths: [
                    // @ts-expect-error: this is not a valid path
                    'invalid path',
                ],
            }).url;
            const validUrl = mockRouter.createRouteUrl({
                paths: [
                    'gallery',
                    'some id',
                ],
            }).url;

            assert.notStrictEquals(
                sanitizedInvalidUrl,
                parseUrl(sanitizedInvalidUrl).fullPath,
                'created url should include more than just the path',
            );
            assert.strictEquals(parseUrl(sanitizedInvalidUrl).fullPath, '/home');
            assert.strictEquals(parseUrl(validUrl).fullPath, '/gallery/some id');
        }),
    );

    it(
        'creates URLs with the base path',
        testRouter(
            {
                basePath: 'some-base',
            },
            (mockRouter) => {
                window.history.replaceState(undefined, '', '/some-base');
                const validUrl = mockRouter.createRouteUrl({
                    paths: [
                        'gallery',
                        'some id',
                    ],
                }).url;

                assert.strictEquals(parseUrl(validUrl).fullPath, '/some-base/gallery/some id');
            },
        ),
    );

    it(
        'excludes base URL if current URL excludes it',
        testRouter({}, (mockRouter) => {
            const validUrl = mockRouter.createRouteUrl({
                paths: [
                    'gallery',
                    'some id',
                ],
            }).url;

            assert.strictEquals(parseUrl(validUrl).fullPath, '/gallery/some id');
        }),
    );

    it(
        'creates a url with partial paths',
        testRouter(
            {
                sanitizeRoute(rawRoute) {
                    return {
                        paths: sanitizeMockPaths(rawRoute),
                        search: undefined,
                        hash: rawRoute.hash || 'hi',
                    };
                },
            },
            (mockRouter) => {
                assert.isTrue(
                    mockRouter.setRoute({
                        paths: [
                            'about',
                            'team',
                        ],
                    }),
                );
                const validUrl = mockRouter.createRouteUrl({
                    hash: '#hello-there',
                }).url;

                assert.strictEquals(parseUrl(validUrl).fullPath, '/about/team#hello-there');
                assert.strictEquals(parseUrl(globalThis.location.href).fullPath, '/about/team#hi');
                assert.deepEquals(mockRouter.readCurrentRoute(), {
                    hash: 'hi',
                    paths: [
                        'about',
                        'team',
                    ],
                    search: undefined,
                });
            },
        ),
    );

    it(
        'does not set a route if paused',
        testRouter({isPaused: true}, (mockRouter, hrefBefore) => {
            const newRoute = {
                paths: [
                    'about',
                    'team',
                ],
            } as const satisfies Partial<SpaRoute<MockValidPaths>>;
            const newUrl = mockRouter.createRouteUrl(newRoute);

            assert.isFalse(mockRouter.setRoute(newRoute));

            assert.strictEquals(globalThis.location.href, hrefBefore);
            assert.notStrictEquals(globalThis.location.href, newUrl);

            globalThis.history.replaceState(undefined, '', '/test');
            assert.strictEquals(
                globalThis.location.pathname,
                '/test',
                'path should not have gotten sanitized',
            );
        }),
    );

    it(
        'removes a listener',
        testRouter({isPaused: true}, (mockRouter) => {
            assert.strictEquals(mockRouter.getListenerCount(), 0);
            const removeListener = mockRouter.listen(true, () => {});
            assert.strictEquals(mockRouter.getListenerCount(), 1);
            removeListener();
            assert.strictEquals(mockRouter.getListenerCount(), 0);
        }),
    );

    it(
        'blocks multiple listeners by default',
        testRouter({isPaused: true}, (mockRouter) => {
            assert.throws(() => {
                mockRouter.listen(true, () => {});
                mockRouter.listen(true, () => {});
            });
        }),
    );

    it(
        'allows a customized listener max',
        testRouter({isPaused: true, maxListenerCount: 3}, (mockRouter) => {
            mockRouter.listen(true, () => {});
            mockRouter.listen(true, () => {});
            mockRouter.listen(true, () => {});
            assert.throws(() => {
                mockRouter.listen(true, () => {});
            });
        }),
    );

    it(
        'does not set an identical route',
        testRouter({}, (mockRouter) => {
            const events: FullSpaRoute[] = [];

            mockRouter.listen(false, (route) => {
                events.push(route);
            });

            assert.isTrue(
                mockRouter.setRoute({
                    paths: [
                        'gallery',
                        'team',
                    ],
                }),
            );
            assert.isLengthExactly(events, 1);
            assert.isFalse(
                mockRouter.setRoute({
                    paths: [
                        'gallery',
                        'team',
                    ],
                }),
            );

            assert.isLengthExactly(events, 1);
        }),
    );

    it(
        'reads back button events',
        testRouter({}, async (mockRouter) => {
            const events: FullSpaRoute[] = [];

            mockRouter.listen(false, (route) => {
                events.push(route);
            });

            assert.isTrue(
                mockRouter.setRoute({
                    paths: [
                        'about',
                    ],
                }),
            );
            assert.isLengthExactly(events, 1);
            globalThis.history.back();

            await waitUntil.isLengthExactly(2, () => events);
        }),
    );

    it(
        'reads back button events',
        testRouter({}, async (mockRouter) => {
            const events: FullSpaRoute[] = [];

            mockRouter.listen(false, (route) => {
                events.push(route);
            });

            assert.isTrue(
                mockRouter.setRoute({
                    paths: [
                        'about',
                        'team',
                    ],
                }),
            );
            assert.isLengthExactly(events, 1);
            globalThis.history.back();

            await waitUntil.isLengthExactly(2, () => events);
        }),
    );

    it(
        'routes from setRouteOnDirectNavigation',
        testRouter({}, (mockRouter, hrefBefore) => {
            assert.isTrue(
                mockRouter.setRouteOnDirectNavigation(
                    {
                        paths: [
                            'about',
                            'team',
                        ],
                    },
                    {
                        altKey: false,
                        button: 0,
                        ctrlKey: false,
                        metaKey: false,
                        shiftKey: false,
                        type: 'mousedown',
                        preventDefault() {},
                    },
                ),
            );

            assert.strictEquals(parseUrl(globalThis.location.href).fullPath, '/about/team');
            assert.notStrictEquals(hrefBefore, '/about/team');
        }),
    );

    it(
        'does not route from setRouteOnDirectNavigation on right click',
        testRouter({}, (mockRouter, hrefBefore) => {
            assert.isFalse(
                mockRouter.setRouteOnDirectNavigation(
                    {
                        paths: [
                            'about',
                        ],
                    },
                    {
                        altKey: false,
                        button: 1,
                        ctrlKey: false,
                        metaKey: false,
                        shiftKey: false,
                        type: 'mousedown',
                        preventDefault() {},
                    },
                ),
            );

            assert.notStrictEquals(parseUrl(globalThis.location.href).fullPath, '/about/website');
            assert.strictEquals(globalThis.location.href, hrefBefore);
        }),
    );
});
