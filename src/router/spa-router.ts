import {RouterInitParams} from './router-init-params';
export type RouteListener<ValidRoutes extends string[]> = (routes: Readonly<ValidRoutes>) => void;

export type SpaRouter<ValidRoutes extends string[]> = {
    addRouteListener: (
        fireImmediately: boolean,
        listener: RouteListener<ValidRoutes>,
    ) => RouteListener<ValidRoutes>;
    createRoutesUrl: (routes: Readonly<ValidRoutes>) => string;
    getCurrentRawRoutes: () => Readonly<string[]>;
    initParams: Readonly<RouterInitParams<ValidRoutes>>;
    listeners: Set<RouteListener<ValidRoutes>>;
    /** Used to track route sanitization depth to prevent infinite sanitizing loops. */
    sanitizationDepth: number;
    removeRouteListener: (listenerToRemove: RouteListener<ValidRoutes>) => boolean;
    /**
     * Used to sanitize routes. Uses the user input sanitizer. If the user did not assign any input
     * sanitizer to the init parameters, this simply returns the inputs.
     */
    sanitizeRoutes: (routes: Readonly<string[]> | Readonly<ValidRoutes>) => Readonly<ValidRoutes>;
    setRoutes: (
        routes: Readonly<ValidRoutes>,
        /**
         * Used for a back button or when replacing routes with sanitized routes. In every other
         * case, pass false here or leave it empty (it defaults to false).
         */
        replace?: boolean,
        /**
         * If set to true, the router will set the window location / URL even when the current URL
         * is equivalent to the new URL that will be set.
         */
        force?: boolean,
    ) => void;
};

// some actual JavaScript is needed so this file gets picked up in compilation lol
export function isSpaRouter(rawInput: unknown): rawInput is SpaRouter<any> {
    if (typeof rawInput !== 'object' || !rawInput) {
        return false;
    }
    const propsToCheck: Record<keyof SpaRouter<any>, string> = {
        setRoutes: 'function',
        createRoutesUrl: 'function',
        addRouteListener: 'function',
        getCurrentRawRoutes: 'function',
        listeners: 'object',
        sanitizationDepth: 'number',
        sanitizeRoutes: 'function',
        removeRouteListener: 'function',
        initParams: 'object',
    };

    const input = rawInput as SpaRouter<any>;

    const missingProperties = (Object.keys(propsToCheck) as (keyof SpaRouter<any>)[]).filter(
        (key) => {
            if (!input.hasOwnProperty(key) || !(typeof input[key] !== propsToCheck[key])) {
                return true;
            }

            return false;
        },
    );

    return !missingProperties.length;
}
