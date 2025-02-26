import type {Overwrite} from '@augment-vir/common';
import {defineShape, indexedKeys, isValidShape, optional, or} from 'object-shape-tester';

/**
 * Base for all valid paths type parameters.
 *
 * @category Internal
 */
export type ValidPathsBase = ReadonlyArray<string>;
/**
 * Base for all valid search type parameters.
 *
 * @category Internal
 */
export type ValidSearchBase = Readonly<Record<string, ReadonlyArray<string>>>;
/**
 * Base for all valid hash type parameters.
 *
 * @category Internal
 */
// eslint-disable-next-line sonarjs/redundant-type-aliases
export type ValidHashBase = string;

/**
 * {@link SpaRoute} but with all properties required.
 *
 * @category Main
 */
export type FullSpaRoute<
    ValidPaths extends ValidPathsBase = ValidPathsBase,
    ValidSearch extends ValidSearchBase | undefined = ValidSearchBase | undefined,
    ValidHash extends ValidHashBase | undefined = ValidHashBase | undefined,
> = Required<SpaRoute<ValidPaths, ValidSearch, ValidHash>>;

/**
 * A type that contains all route information for a single URL.
 *
 * @category Main
 */
export type SpaRoute<
    ValidPaths extends ValidPathsBase = ValidPathsBase,
    ValidSearch extends ValidSearchBase | undefined = ValidSearchBase | undefined,
    ValidHash extends ValidHashBase | undefined = ValidHashBase | undefined,
> = {
    /** An array of the URL's paths. */
    paths: ValidPaths;
    /** An object of the URL's search params. */
    search?: ValidSearch;
    /** The URL's hash string, excluding the `#` character. */
    hash?: ValidHash;
};

const spaRouteShape = defineShape({
    paths: [''],
    search: optional(
        or(
            undefined,
            indexedKeys({
                keys: '',
                values: [''],
                required: false,
            }),
        ),
    ),
    hash: optional(or(undefined, '')),
});

/**
 * Detects if the input is a `SpaRoute`. Note that this cannot check for type safety for _your_
 * specific route type, use the `sanitizeRoute` constructor param in `SpaRouter` for that purpose.
 *
 * @category Internal
 */
export function isSpaRoute(input: unknown): input is SpaRoute {
    return isValidShape(input, spaRouteShape);
}

/**
 * Narrow a route to a specific path.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {PathTree, FullSpaRoute, SpaRouteByPath} from 'spa-router-vir';
 *
 * const myAppPathTree = new PathTree({
 *     allowBare: true,
 *     children: {
 *         myRoute: {},
 *     },
 * });
 *
 * export type MyAppFullRoute = Readonly<
 *     FullSpaRoute<typeof myAppPathTree.PathsType, undefined, undefined>
 * >;
 *
 * export type MySpecificRoute<Paths extends MyAppFullRoute['paths']> = Readonly<
 *     SpaRouteByPath<Paths, MyAppFullRoute>
 * >;
 *
 * function handleSpecificRoute(
 *     specificRoute: MySpecificRoute<typeof myAppPathTree.paths.children.myRoute.fullPaths>,
 * ) {}
 * ```
 */
export type SpaRouteByPath<
    Paths extends OriginalFullSpaRoute['paths'],
    OriginalFullSpaRoute extends FullSpaRoute,
> = Overwrite<
    OriginalFullSpaRoute,
    {
        paths: Extract<OriginalFullSpaRoute['paths'], Readonly<[...Paths, ...any[]]>>;
    }
>;
