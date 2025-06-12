import {type PartialWithUndefined} from '@augment-vir/common';
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
 * Checks if a given path array exactly equals the given {@link PathTree} sub-tree. This is in
 * contrast with {@link matchesPaths} which only checks to see if the given `treePaths` are included
 * in `currentPaths`.
 *
 * @category Internal
 */
export function exactlyMatchesPaths<
    const TreePaths extends Readonly<Pick<GenericTreePaths, 'fullPaths' | 'PathsType'>>,
>(
    currentPaths: ReadonlyArray<string>,
    treePaths: Readonly<TreePaths>,
): currentPaths is Readonly<TreePaths['fullPaths']> {
    return (
        treePaths.fullPaths.length === currentPaths.length && matchesPaths(currentPaths, treePaths)
    );
}

/**
 * Options for {@link routeHasPaths}.
 *
 * @category Internal
 */
export type RouteHasPathsOptions<ExactMatch extends boolean = boolean> = PartialWithUndefined<{
    /**
     * If true, requires exact equality instead of just checking if the tree paths are a prefix of
     * the current route paths.
     *
     * @default false
     */
    exactMatch: ExactMatch;
}>;

/**
 * Checks if the given route matches the given {@link PathTree} sub-tree and type guards the route.
 *
 * @category Main
 */
export function routeHasPaths<
    const TreePaths extends Readonly<Pick<GenericTreePaths, 'fullPaths' | 'PathsType'>>,
    const Route extends Readonly<Pick<FullSpaRoute, 'paths'>>,
    const ExactMatch extends boolean = false,
>(
    currentRoute: Readonly<Route>,
    treePaths: Readonly<TreePaths>,
    options?: Readonly<RouteHasPathsOptions<ExactMatch>>,
): currentRoute is ExactMatch extends true
    ? Readonly<Route & {paths: TreePaths['fullPaths']}>
    : Readonly<SpaRouteByPath<TreePaths['PathsType'], Route>> {
    if (options?.exactMatch) {
        return exactlyMatchesPaths(currentRoute.paths, treePaths);
    } else {
        return matchesPaths(currentRoute.paths, treePaths);
    }
}
