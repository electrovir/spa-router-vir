import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {assertValidShape} from 'object-shape-tester';
import {type FullSpaRoute} from './spa-route.js';
import {
    type RouteSanitizer,
    type SpaRouterParams,
    spaRouterParamsShape,
} from './spa-router-params.js';
import {type MockValidPaths} from './spa-router.mock.js';

describe('SpaRouterParams', () => {
    it('only requires the sanitizeRoute param', () => {
        const exampleParams = {
            sanitizeRoute(rawRoute) {
                return rawRoute as any;
            },
        } as const satisfies SpaRouterParams;

        assertValidShape(exampleParams, spaRouterParamsShape);
        assert.tsType(exampleParams).matches<SpaRouterParams>();
        assert.tsType({}).notMatches<SpaRouterParams>();
    });

    it('allows undefined for all optional params', () => {
        const exampleParams = {
            sanitizeRoute(rawRoute) {
                return rawRoute as any;
            },
            basePath: undefined,
            disableWarnings: undefined,
            isPaused: undefined,
            maxListenerCount: undefined,
        } as const satisfies SpaRouterParams;

        assertValidShape(exampleParams, spaRouterParamsShape);
        assert.tsType(exampleParams).matches<SpaRouterParams>();
    });

    it('has correct types for all params', () => {
        const exampleParams: SpaRouterParams = {
            sanitizeRoute(rawRoute: FullSpaRoute) {
                return rawRoute as any;
            },
            basePath: '',
            disableWarnings: true,
            isPaused: true,
            maxListenerCount: 3,
        };
        assertValidShape(exampleParams, spaRouterParamsShape);
        assert.tsType(exampleParams).matches<SpaRouterParams>();
    });
});

describe('RouteSanitizer', () => {
    it('has the correct input type', () => {
        const sanitizerExample: RouteSanitizer = (input) => {
            assert.tsType(input).equals<Readonly<FullSpaRoute>>();
            return input as any;
        };
    });

    it('requires the correct output type', () => {
        const goodSanitizerExample: RouteSanitizer<MockValidPaths> = () => {
            return {
                paths: ['home'],
                hash: undefined,
                search: undefined,
            };
        };
        // @ts-expect-error: the return type has not been sanitized
        const badSanitizerExample: RouteSanitizer<MockValidPaths> = (input) => {
            return input;
        };
    });

    it('just returns the current route from the default sanitizer', () => {
        const route = {
            hash: undefined,
            paths: [
                'hello',
                'some route',
            ],
            search: undefined,
        };
        assert.strictEquals(spaRouterParamsShape.defaultValue.sanitizeRoute(route), route);
    });
});
