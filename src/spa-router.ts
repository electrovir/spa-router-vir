import {check} from '@augment-vir/assert';
import {addPrefix} from '@augment-vir/common';
import {assertValidShape} from 'object-shape-tester';
import {type ExcludeNoUpdate, Observable, type ObservableListener} from 'observavir';
import {listenTo} from 'typed-event-target';
import {SearchParamStrategy, buildUrl, joinUrlPaths, parseUrl} from 'url-vir';
import {SanitizationDepthMaxed} from './errors/sanitization-depth-maxed.error.js';
import {SpaRouterError} from './errors/spa-router.error.js';
import {
    type FullSpaRoute,
    type SpaRoute,
    type ValidHashBase,
    type ValidPathsBase,
    type ValidSearchBase,
} from './spa-route.js';
import {type SpaRouterParams, spaRouterParamsShape} from './spa-router-params.js';
import {shouldClickEventTriggerRouteChange} from './util/click-event-should-set-routes.js';
import {
    consolidateGlobalUrlEvents,
    globalLocationChangeEventName,
} from './util/consolidate-global-url-events.js';
import {parseUrlIntoRawRoute} from './util/parse-url.js';

/**
 * A router for SPAs which allows listening to and setting the window's URL with type safety.
 *
 * @category Main
 */
export class SpaRouter<
    ValidPaths extends ValidPathsBase = ValidPathsBase,
    ValidSearch extends ValidSearchBase | undefined = undefined,
    ValidHash extends ValidHashBase | undefined = undefined,
> {
    protected innerObservable: Observable<FullSpaRoute<ValidPaths, ValidSearch, ValidHash>>;
    /**
     * Removes the `SpaRouter`'s listener to global URL changes. This is used when `.destroy()` is
     * called.
     */
    protected removeGlobalListener: () => void;
    protected sanitizationDepth = 0;
    /** The params with which this `SpaRouter` was initially constructed. */
    public params: SpaRouterParams<ValidPaths, ValidSearch, ValidHash>;

    constructor(params: Readonly<SpaRouterParams<ValidPaths, ValidSearch, ValidHash>>) {
        assertValidShape(params, spaRouterParamsShape);
        this.params = {...params};
        const sanitizedCurrentUrl = this.readCurrentRoute();
        this.innerObservable = new Observable<FullSpaRoute<ValidPaths, ValidSearch, ValidHash>>({
            defaultValue: sanitizedCurrentUrl,
            /** Also consider values unequal so they are always set. */
            equalityCheck: () => false,
        });

        consolidateGlobalUrlEvents();
        this.removeGlobalListener = listenTo(globalThis, globalLocationChangeEventName, () => {
            if (this.params.isPaused) {
                return;
            } else if (this.sanitizationDepth > 2) {
                /* c8 ignore start: can't capture this error */
                throw new SanitizationDepthMaxed(
                    'Looping route sanitization detected; aborting window URL change listener.',
                );
            }
            /* c8 ignore stop */

            const rawRoute = parseUrlIntoRawRoute(globalThis.location.href, this.params.basePath);

            const sanitizedRoute = params.sanitizeRoute(rawRoute);

            if (check.jsonEquals(rawRoute, sanitizedRoute)) {
                this.sanitizationDepth = 0;
                this.innerObservable.setValue(sanitizedRoute);
            } else {
                this.sanitizationDepth++;
                this.setRoute(sanitizedRoute, {replace: true});
                if (!params.disableWarnings) {
                    console.warn('Route sanitized.', {
                        from: rawRoute,
                        to: sanitizedRoute,
                    });
                }
            }
        });

        /** Ensure that the initial sanitized route is indeed the current window URL. */
        this.setRoute(sanitizedCurrentUrl, {replace: true});
    }

    /** Detect if the given route already includes the router's `basePath`. */
    protected routeIncludesBasePath(route: Readonly<Partial<Pick<SpaRoute, 'paths'>>>): boolean {
        if (!route.paths || !this.params.basePath) {
            return false;
        }
        return joinUrlPaths(...route.paths).startsWith(this.params.basePath);
    }

    /** Reads the current route with the sanitizer so it's type safe. */
    public readCurrentRoute(): FullSpaRoute<ValidPaths, ValidSearch, ValidHash> {
        return this.sanitizeRoute(
            parseUrlIntoRawRoute(globalThis.location.href, this.params.basePath),
        );
    }

    /** Run the sanitizer this `SpaRouter` instance was initialized with on any given route. */
    public sanitizeRoute(
        rawRoute: Readonly<FullSpaRoute>,
    ): FullSpaRoute<ValidPaths, ValidSearch, ValidHash> {
        return this.params.sanitizeRoute(rawRoute);
    }

    /** Create a full URL href string from the given route (combined with the current route). */
    public createRouteUrl(
        newRoute: Readonly<Partial<SpaRoute<ValidPaths, ValidSearch, ValidHash>>>,
    ): string {
        const fullNewRoute: FullSpaRoute = {
            ...parseUrlIntoRawRoute(globalThis.location.href, this.params.basePath),
            ...newRoute,
        };
        const sanitizedNewRoute = this.sanitizeRoute(fullNewRoute);

        const shouldInsertBasePath =
            /** Check if the current website is actually using the base path currently. */
            this.routeIncludesBasePath(parseUrlIntoRawRoute(globalThis.location.href, undefined)) &&
            /** Check if the given new route is missing the base path. */
            !this.routeIncludesBasePath(sanitizedNewRoute);

        const newRouteWithBase =
            shouldInsertBasePath && this.params.basePath
                ? {
                      ...sanitizedNewRoute,
                      paths: [
                          this.params.basePath,
                          ...sanitizedNewRoute.paths,
                      ],
                  }
                : sanitizedNewRoute;

        const urlParts = buildUrl(
            globalThis.location.href,
            {
                paths: newRouteWithBase.paths,
                search: newRouteWithBase.search,
                hash: newRouteWithBase.hash
                    ? addPrefix({value: newRouteWithBase.hash, prefix: '#'})
                    : '',
            },
            {
                searchParamStrategy: SearchParamStrategy.Clear,
            },
        );

        return urlParts.href;
    }

    /**
     * Write a new route to the window URL after sanitization. If the sanitized new route equals the
     * current window URL, no update will occur. When an update _does_ occur, route listeners will
     * be fired.
     *
     * @returns Whether the route was set or not.
     */
    public setRoute(
        newRoute: Readonly<Partial<SpaRoute<ValidPaths, ValidSearch, ValidHash>>>,
        options: Readonly<{
            /**
             * If set to `true`, the current route will be _replaced_ with the new route. What this
             * means in practice is that users won't be able to hit the "back" button to go back to
             * the previous route.
             *
             * @default false
             */
            replace?: boolean | undefined;
            /**
             * If set to true, the new route will be set even if it's equal to the current route.
             *
             * @default false
             */
            force?: boolean | undefined;
        }> = {},
    ): boolean {
        const newUrl: string = this.createRouteUrl(newRoute);
        const {fullPath} = parseUrl(newUrl);

        if (this.params.isPaused) {
            return false;
        } else if (
            !options.force &&
            check.jsonEquals(parseUrl(globalThis.location.href).fullPath, fullPath)
        ) {
            return false;
        } else if (options.replace) {
            globalThis.history.replaceState(undefined, '', fullPath);
            return true;
        } else {
            globalThis.history.pushState(undefined, '', fullPath);
            return true;
        }
    }

    /**
     * Sets the given route using the given `SpaRouter` only if the user's click event was for
     * direct navigation (rather than trying to open it in a new tab or right clicking on it).
     *
     * @returns Whether the route was routed to or not.
     */
    public setRouteOnDirectNavigation(
        newRoute: Readonly<Partial<SpaRoute<ValidPaths, ValidSearch, ValidHash>>>,
        mouseEvent: Readonly<
            Pick<
                MouseEvent,
                'type' | 'altKey' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'button' | 'preventDefault'
            >
        >,
    ): boolean {
        if (shouldClickEventTriggerRouteChange(mouseEvent)) {
            mouseEvent.preventDefault();
            return this.setRoute(newRoute);
        } else {
            return false;
        }
    }

    /**
     * Listen to route changes.
     *
     * @returns A callback to remove the listener.
     */
    public listen(
        fireImmediately: boolean,
        listener: ObservableListener<
            ExcludeNoUpdate<FullSpaRoute<ValidPaths, ValidSearch, ValidHash>>
        >,
    ) {
        const maxListenerCount =
            this.params.maxListenerCount == undefined ? 1 : this.params.maxListenerCount;

        if (maxListenerCount && this.innerObservable.getListenerCount() >= maxListenerCount) {
            throw new SpaRouterError(
                `Attempting to attach more route listeners than the \`maxListenerCount\` of '${maxListenerCount}'.`,
            );
        }
        this.innerObservable.listen(fireImmediately, listener);

        return () => this.removeListener(listener);
    }

    /**
     * Removes a route listener.
     *
     * @returns `true` if the callback was removed. `false` if the callback was not removed (meaning
     *   it was never added in the first place).
     */
    public removeListener(
        listener: ObservableListener<
            ExcludeNoUpdate<FullSpaRoute<ValidPaths, ValidSearch, ValidHash>>
        >,
    ) {
        return this.innerObservable.removeListener(listener);
    }

    /** Count how many route listeners have been attached. */
    public getListenerCount() {
        return this.innerObservable.getListenerCount();
    }

    /**
     * Removes all listeners. Note that this does not undo the global URL event consolidation
     * performed by `consolidateGlobalUrlEvents`.
     */
    public destroy() {
        this.params.isPaused = true;
        this.removeGlobalListener();
        this.innerObservable.destroy();
    }
}
