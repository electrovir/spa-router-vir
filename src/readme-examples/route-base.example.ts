import {SpaRouter} from '../index.js';
import {ValidRouterPaths, sanitizePaths} from './router-creation.example.js';

export const myRouter = new SpaRouter<
    /** Use the same route type parameters as the earlier example for simplicity. */
    ValidRouterPaths,
    undefined,
    undefined
>({
    /** Use the same route sanitizer as the earlier example for simplicity. */
    sanitizeRoute(rawRoute) {
        return {
            paths: sanitizePaths(rawRoute),
            search: undefined,
            hash: undefined,
        };
    },
    basePath: 'my-repo',
});
