/* eslint-disable @virmator/prefer-parse-url */

import {describe, itCases} from '@augment-vir/test';
import {parseUrlIntoRawRoute} from './parse-url.js';

describe(parseUrlIntoRawRoute.name, () => {
    itCases(parseUrlIntoRawRoute, [
        {
            it: 'parses a URL string with all parts',
            inputs: [
                'https://user:pass@example.com:8765/path/1/2?hello=there&why#time-to-go',
            ],
            expect: {
                paths: [
                    'path',
                    '1',
                    '2',
                ],
                search: {
                    hello: ['there'],
                    why: [],
                },
                hash: 'time-to-go',
            },
        },
        {
            it: 'parses a URL object with all parts',
            inputs: [
                new URL('https://user:pass@example.com:8765/path/1/2?hello=there&why#time-to-go'),
            ],
            expect: {
                paths: [
                    'path',
                    '1',
                    '2',
                ],
                search: {
                    hello: ['there'],
                    why: [],
                },
                hash: 'time-to-go',
            },
        },
        {
            it: 'parses just a path',
            inputs: [
                '/path/1/2?hello=there&why#time-to-go',
            ],
            expect: {
                paths: [
                    'path',
                    '1',
                    '2',
                ],
                search: {
                    hello: ['there'],
                    why: [],
                },
                hash: 'time-to-go',
            },
        },
        {
            it: 'omits missing hash',
            inputs: [
                '/path/1/2?hello=there&why',
            ],
            expect: {
                paths: [
                    'path',
                    '1',
                    '2',
                ],
                search: {
                    hello: ['there'],
                    why: [],
                },
                hash: undefined,
            },
        },
        {
            it: 'omits missing search',
            inputs: [
                '/path/1/2',
            ],
            expect: {
                paths: [
                    'path',
                    '1',
                    '2',
                ],
                search: undefined,
                hash: undefined,
            },
        },
        {
            it: 'handles an empty path',
            inputs: [
                '/?hello=there',
            ],
            expect: {
                paths: [],
                search: {
                    hello: ['there'],
                },
                hash: undefined,
            },
        },
        {
            it: 'handles empty everything',
            inputs: [
                '/',
            ],
            expect: {
                paths: [],
                search: undefined,
                hash: undefined,
            },
        },
    ]);
});
