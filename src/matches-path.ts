import {type GenericTreePaths, type PathTree} from './path-tree.js';
import {type FullSpaRoute, type SpaRouteByPath} from './spa-route.js';

/**
 * Checks if a given path array matches the given {@link PathTree} sub-tree.
 *
 * @category Internal
 */
export function matchesPaths<
    const TreePaths extends Readonly<Pick<GenericTreePaths, 'fullPaths' | 'PathsType'>>,
>(
    currentPaths: ReadonlyArray<string>,
    treePaths: Readonly<TreePaths>,
): currentPaths is Readonly<[...TreePaths['PathsType'], ...string[]]> {
    return treePaths.fullPaths.every((path, index) => {
        /** Allow any path when there's a path param. */
        if (path.startsWith(':')) {
            return true;
        } else {
            return currentPaths[index] === path;
        }
    });
}

/**
 * Checks if the given route matches the given {@link PathTree} sub-tree and type guards the route.
 *
 * @category Main
 */
export function routeHasPaths<
    const TreePaths extends Readonly<Pick<GenericTreePaths, 'fullPaths' | 'PathsType'>>,
    const Route extends Readonly<Pick<FullSpaRoute, 'paths'>>,
>(
    currentRoute: Readonly<Route>,
    treePaths: Readonly<TreePaths>,
): currentRoute is Readonly<SpaRouteByPath<TreePaths['PathsType'], Route>> {
    return matchesPaths(currentRoute.paths, treePaths);
}
