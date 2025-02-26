import {PathTree, SpaRouter} from '../index.js';

const myPathTree = new PathTree({
    allowBare: true,
    children: {
        'path-a': {
            allowBare: false,
            children: {
                'nested-path1': {},
                'nested-path2': {},
            },
        },
        'path-b': {},
    },
});

export const myRouter = new SpaRouter({
    sanitizeRoute(rawRoute) {
        return {
            paths: myPathTree.sanitizePaths(rawRoute.paths),
            hash: undefined,
            search: undefined,
        };
    },
});
