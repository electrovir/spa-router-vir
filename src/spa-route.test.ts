import {assert} from '@augment-vir/assert';
import {describe, it, itCases} from '@augment-vir/test';
import {
    ValidHashBase,
    ValidPathsBase,
    ValidSearchBase,
    isSpaRoute,
    type SpaRoute,
} from './spa-route.js';
import {MockValidPaths} from './spa-router.mock.js';

describe('ValidPathsBase', () => {
    it('matches more specific sub types', () => {
        assert.tsType<['hello there']>().matches<ValidPathsBase>();
        assert.tsType<[]>().matches<ValidPathsBase>();
    });

    it('only allows strings', () => {
        assert.tsType<[number]>().notMatches<ValidPathsBase>();
        assert.tsType<[symbol]>().notMatches<ValidPathsBase>();
    });
});

describe('ValidSearchBase', () => {
    it('matches more specific sub types', () => {
        assert
            .tsType<{
                singleValue: [string];
            }>()
            .matches<ValidSearchBase>();
        assert
            .tsType<{
                multiValue: string[];
            }>()
            .matches<ValidSearchBase>();
    });

    it('blocks individual string values', () => {
        assert
            .tsType<{
                singleValue: string;
            }>()
            .notMatches<ValidSearchBase>();
    });
});

describe('ValidHashBase', () => {
    it('matches more specific sub types', () => {
        assert.tsType<`hello=there`>().matches<ValidHashBase>();
    });

    it('only allows strings', () => {
        assert.tsType<number>().notMatches<ValidHashBase>();
        assert.tsType<symbol>().notMatches<ValidHashBase>();
    });
});

describe('FullRoute', () => {
    it('restricts a route to its type parameters', () => {
        assert
            .tsType<{
                paths: ['home'];
            }>()
            .matches<SpaRoute<MockValidPaths, undefined, undefined>>();
        assert
            .tsType<{
                paths: ['home'];
                search: {
                    notAllowedKey: ['not allowed value'];
                };
            }>()
            .notMatches<SpaRoute<MockValidPaths, undefined, undefined>>();
        assert
            .tsType<{
                paths: ['home'];
                hash: 'derp';
            }>()
            .notMatches<SpaRoute<MockValidPaths, undefined, undefined>>();
    });
});

describe(isSpaRoute.name, () => {
    itCases(isSpaRoute, [
        {
            it: 'accepts a minimal FullRoute',
            input: {
                paths: ['hi'],
            },
            expect: true,
        },
        {
            it: 'accepts a full FullRoute',
            input: {
                paths: ['hi'],
                search: {hi: ['hi']},
                hash: 'hi',
            },
            expect: true,
        },
        {
            it: 'rejects search with just a string value',
            input: {
                paths: ['hi'],
                search: {hi: 'hi'},
            },
            expect: false,
        },
        {
            it: 'rejects string search',
            input: {
                paths: ['hi'],
                search: 'hi',
            },
            expect: false,
        },
        {
            it: 'rejects numeric search',
            input: {
                paths: ['hi'],
                search: {hi: [32]},
            },
            expect: false,
        },
        {
            it: 'rejects missing paths',
            input: {
                search: {hi: ['hi']},
                hash: 'hi',
            },
            expect: false,
        },
        {
            it: 'rejects numeric paths',
            input: {
                paths: [5],
                search: {hi: ['hi']},
                hash: 'hi',
            },
            expect: false,
        },
    ]);
});
