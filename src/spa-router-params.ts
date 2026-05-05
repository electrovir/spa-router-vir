import {type Overwrite} from '@augment-vir/common';
import {defineShape, nullableShape} from 'object-shape-tester';
import {
    type FullSpaRoute,
    type ValidHashBase,
    type ValidPathsBase,
    type ValidSearchBase,
} from './spa-route.js';

/**
 * A function that sanitizes a route, ensuring that the raw input matches the type safety of a
 * specific `SpaRouter` implementation.
 *
 * @category Internal
 */
export type RouteSanitizer<
    ValidPaths extends ValidPathsBase = ValidPathsBase,
    ValidSearch extends ValidSearchBase | undefined = undefined,
    ValidHash extends ValidHashBase | undefined = undefined,
> = (
    rawRoute: Readonly<FullSpaRoute>,
) => Readonly<FullSpaRoute<ValidPaths, ValidSearch, ValidHash>>;

/**
 * A function that determines whether a sanitized route is allowed to be set on the window URL.
 * Return `false` to block the route change.
 *
 * @category Internal
 */
export type RouteAllowedCheck<
    ValidPaths extends ValidPathsBase = ValidPathsBase,
    ValidSearch extends ValidSearchBase | undefined = undefined,
    ValidHash extends ValidHashBase | undefined = undefined,
> = (newRoute: Readonly<FullSpaRoute<ValidPaths, ValidSearch, ValidHash>>) => boolean;

/**
 * Used to verify if an object is a valid `SpaRouterParams` instance.
 *
 * @category Internal
 */
export const spaRouterParamsShape = defineShape({
    /**
     * This can used to provide a base route for the router to consider the root of your SPA. This
     * must NOT also be a part of your route's valid paths array.
     *
     * Example: in GitHub Pages, the root of each page is a relative path:
     * `<user>.github.io/<repo-name>`. To make this router work in GitHub pages as well as local
     * development, use the `<repo-name>` part as your `basePath`.
     *
     * Concrete example: in `electrovir.github.io/threejs-experiments`, `threejs-experiments` is the
     * `basePath`.
     *
     * @default `''`
     */
    basePath: nullableShape(''),
    /**
     * Use this to rewrite a route before it makes it to your application. This is necessary to
     * ensure that the types for your route is maintained.
     */
    sanitizeRoute: ((route) => route) as RouteSanitizer,
    /**
     * Used mostly for debugging purposes to prevent yourself from accidentally adding tons of event
     * listeners. When left undefined or set to zero, this property isn't used at all and there is
     * no maximum listener count. When set to a truthy number, the maximum comes into effect.
     *
     * @default 1
     */
    maxListenerCount: nullableShape(1),
    /** Set to `true` to turn off warning logs. */
    disableWarnings: nullableShape(false),
    /**
     * Set this to `true` to disable the router without destroying it. Use this if you have multiple
     * routers to ensure you only have one running at a time.
     */
    isPaused: nullableShape(false),
    /**
     * Optionally provide a function to gate whether a sanitized route is allowed to be set. When it
     * returns `false`, the route change is blocked.
     */
    /* node:coverage ignore next: shape default function body is never invoked at runtime */
    isRouteAllowed: nullableShape((() => true) as RouteAllowedCheck),
});

/**
 * Construction params for `SpaRouter`.
 *
 * @category Internal
 */
export type SpaRouterParams<
    ValidPaths extends ValidPathsBase = ValidPathsBase,
    ValidSearch extends ValidSearchBase | undefined = undefined,
    ValidHash extends ValidHashBase | undefined = undefined,
> = Overwrite<
    typeof spaRouterParamsShape.runtimeType,
    {
        /**
         * Use this to rewrite a route before it makes it to your application. This is necessary to
         * ensure that the types for your route is maintained.
         */
        sanitizeRoute: RouteSanitizer<ValidPaths, ValidSearch, ValidHash>;
        /**
         * Optionally provide a function to gate whether a sanitized route is allowed to be set.
         * When it returns `false`, the route change is blocked.
         */
        isRouteAllowed?: RouteAllowedCheck<ValidPaths, ValidSearch, ValidHash> | undefined | null;
    }
>;
