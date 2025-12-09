import {assert} from '@augment-vir/assert';
import {describe, it, itCases} from '@augment-vir/test';
import {extractPathTree} from './extract-path-tree.js';
import {mockPathTree} from './path-tree.mock.js';

describe(extractPathTree.name, () => {
    it('maintains types', () => {
        const result = extractPathTree(
            [
                'app',
                'uploads',
                'files',
                'fake-file',
                'view',
            ],
            mockPathTree,
            mockPathTree.paths.children.app.children.uploads.children.files.children[':file-path']
                .children.view,
        );

        assert.isDefined(result);

        assert.tsType(result.path).equals<'view'>();
        assert.strictEquals(result.path, 'view');
    });

    function testExtractPathTree(...params: Parameters<typeof extractPathTree>) {
        const result = extractPathTree(...params);

        return result?.fullPaths;
    }

    itCases(testExtractPathTree, [
        {
            it: 'extracts exact path',
            inputs: [
                [
                    'app',
                    'uploads',
                    'files',
                ],
                mockPathTree,
                mockPathTree.paths.children.app.children.uploads.children.files,
            ],
            expect: [
                'app',
                'uploads',
                'files',
            ],
        },
        {
            it: 'accepts a partial match',
            inputs: [
                [
                    'app',
                    'uploads',
                    'files',
                ],
                mockPathTree,
                mockPathTree.paths.children.app,
            ],
            expect: [
                'app',
            ],
        },
        {
            it: 'rejects an invalid path',
            inputs: [
                [
                    'app',
                    'wrong-path',
                    'files',
                ],
                mockPathTree,
                mockPathTree.paths.children.app.children.uploads.children.files,
            ],
            expect: undefined,
        },
        {
            it: 'rejects when no children',
            inputs: [
                [
                    'legal',
                    'wrong-path',
                ],
                mockPathTree,
                mockPathTree.paths.children.legal,
            ],
            expect: undefined,
        },
        {
            it: 'extracts a parameterized path',
            inputs: [
                [
                    'app',
                    'uploads',
                    'files',
                    'fake-file',
                    'view',
                ],
                mockPathTree,
                mockPathTree.paths.children.app.children.uploads.children.files.children[
                    ':file-path'
                ].children.view,
            ],
            expect: [
                'app',
                'uploads',
                'files',
                'fake-file',
                'view',
            ],
        },
        {
            it: 'rejects in invalid parameterized child',
            inputs: [
                [
                    'app',
                    'uploads',
                    'files',
                    'fake-file',
                    'wrong',
                ],
                mockPathTree,
                mockPathTree.paths.children.app.children.uploads.children.files.children[
                    ':file-path'
                ].children.view,
            ],
            expect: undefined,
        },
        {
            it: 'does not extract anyChildren',
            inputs: [
                [
                    'withAny',
                    'uploads',
                ],
                mockPathTree,
                mockPathTree.paths.children.withAny,
            ],
            expect: undefined,
        },
    ]);
});
