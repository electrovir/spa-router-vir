import {defineShape, indexedKeys, isValidShape, or} from 'object-shape-tester';

/**
 * Base for all valid paths type parameters.
 *
 * @category Internal
 */
export type ValidPathsBase = string[];
/**
 * Base for all valid search type parameters.
 *
 * @category Internal
 */
export type ValidSearchBase = Record<string, string[]>;
/**
 * Base for all valid hash type parameters.
 *
 * @category Internal
 */
// eslint-disable-next-line sonarjs/redundant-type-aliases
export type ValidHashBase = string;

/**
 * A type that wraps all route information for a single URL.
 *
 * @category Main
 */
export type FullRoute<
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

const fullRouteShape = defineShape({
    paths: [''],
    search: or(
        undefined,
        indexedKeys({
            keys: '',
            values: [''],
            required: false,
        }),
    ),
    hash: or(undefined, ''),
});

/**
 * Detects if the input is a `FullRoute`. Note that this cannot check for type safety for _your_
 * specific route type, use the `sanitizeRoute` constructor param for `SpaRouter` for that purpose.
 *
 * @category Internal
 */
export function isFullRoute(input: unknown): input is FullRoute {
    return isValidShape(input, fullRouteShape);
}
