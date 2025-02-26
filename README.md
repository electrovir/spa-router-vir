# spa-router-vir

The heroic, type safe, frontend router for any modern Single Page Application (SPA).

It works by hooking into `window.history.pushState` and `window.history.replaceState`.

# Install

Install via npm:

```bash
npm i spa-router-vir
```

# Examples

-   The [GitHub repo for this package](https://github.com/electrovir/spa-router-vir) contains [an example](https://github.com/electrovir/spa-router-vir/tree/main/src/test) which can be tested using `npm start`.
-   The [`threejs-experiments` repo](https://github.com/electrovir/threejs-experiments) utilizes this package.

# Usage

## Creating a Router

Create a router by constructing `SpaRouter`. Ensure that you only ever have a single active router at a time. You must provide a `sanitizeRoute` callback for ensuring that run-time routes actually match your required route types.

Here is an example usage of `SpaRouter` with full run-time route type safety:

<!-- example-link: src/readme-examples/router-creation.example.ts -->

```TypeScript
import {FullSpaRoute, SpaRouter} from 'spa-router-vir';

export const myRouter = new SpaRouter<
    /** The allowed router paths. */
    ValidRouterPaths,
    /** This router does not allow _any_ search params. */
    undefined,
    /** This router does not allow _any_ hash string. */
    undefined
>({
    /**
     * `sanitizeRoute` is required and is the only way to ensure route type safety at run-time. This
     * ensures that all URLs navigated to from within your SPA are valid and handled by your
     * application.
     */
    sanitizeRoute(rawRoute) {
        return {
            paths: sanitizePaths(rawRoute),
            search: undefined,
            hash: undefined,
        };
    },
});

/**
 * Example valid paths that allow the following website URL paths:
 *
 * - `/home`
 * - `/gallery/<any-string>`
 * - `/about`
 * - `/about/team`
 * - `/about/website`
 */
export type ValidRouterPaths =
    | ['home']
    | ['gallery', /** Specific gallery id. */ string]
    | ['about']
    | ['about', 'team' | 'website'];

/** A helper function that specifically sanitizes the `paths` part of the route. */
export function sanitizePaths(rawRoute: Readonly<Pick<FullSpaRoute, 'paths'>>): ValidRouterPaths {
    const topLevelPath = rawRoute.paths[0];

    if (topLevelPath === 'about') {
        if (rawRoute.paths[1] !== 'team' && rawRoute.paths[1] !== 'website') {
            return ['about'];
        } else {
            return [
                'about',
                rawRoute.paths[1],
            ];
        }
    } else if (topLevelPath === 'gallery' && rawRoute.paths[1]) {
        return [
            'gallery',
            rawRoute.paths[1],
        ];
    } else {
        /** Default to this route. */
        return ['home'];
    }
}
```

## Nested paths

Use `PathTree` to easily define complex path nesting with automatic validation and type generation.

<!-- example-link: src/readme-examples/path-tree.example.ts -->

```TypeScript
import {PathTree, SpaRouter} from 'spa-router-vir';

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
```

## Supporting SPAs on GitHub Pages (or other similar services)

To use SpaRouter on GitHub Pages, you must set a `basePath` property when constructing `SpaRouter`. This ensures that your GitHub Pages repo path is maintained:

<!-- example-link: src/readme-examples/route-base.example.ts -->

```TypeScript
import {SpaRouter} from 'spa-router-vir';
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
```

You can see this in action on the [`threejs-experiments`](https://electrovir.github.io/threejs-experiments/home) example demo. Notice that `threejs-experiments` is always the first path and it does not mess up the router.

In addition to setting the router up, to get a SPA to work on GitHub Pages you need to copy paste your `index.html` and rename the copy to `404.html` in the top-level of your GitHub Pages deployed directory. That is done in `threejs-experiments` [as part of the deploy pipeline script](https://github.com/electrovir/threejs-experiments/blob/673be54beec6ce86f297841e863e4523f531b2ab/package.json#L17).

## Listening to route changes

Use `listen` to listen to route changes. When `true`, the first parameter (which is called `fireImmediately`) will force your router to immediately call the given listener callback. This prevents the need to manually call your own callback to update route-specific content on first page load.

<!-- example-link: src/readme-examples/listen-to-route-changes.example.ts -->

```TypeScript
import {myRouter} from './router-creation.example.js';

myRouter.listen(true, (routes) => {
    console.info(routes);
});
```

Listeners can be removed with the `removeListener()` method, or by calling the return value of `.listen()`:

<!-- example-link: src/readme-examples/remove-route-listener.example.ts -->

```TypeScript
import {FullSpaRoute} from 'spa-router-vir';
import {myRouter, ValidRouterPaths} from './router-creation.example.js';

/** Remove a listener with the removal callback. */
{
    const removeListener = myRouter.listen(true, (route) => {
        console.info(route);
    });

    removeListener();
}

/** Remove a listener by keeping track of it and passing it in to `removeListener`. */
{
    function listenToRoute(route: FullSpaRoute<ValidRouterPaths, undefined, undefined>) {
        console.info(route);
    }

    myRouter.listen(true, listenToRoute);

    myRouter.removeListener(listenToRoute);
}
```

## Creating a URL for links

To create a single URL string for any given route, use the `createRouteUrl()` method. This will create a URL that takes the `SpaRouter`'s `basePath` into account, if it's provided, so you don't have to manually handle that yourself.

<!-- example-link: src/readme-examples/create-route-url.example.ts -->

```TypeScript
import {myRouter} from './router-creation.example.js';

document.getElementsByTagName('a')[0]!.href = myRouter.createRouteUrl({
    paths: [
        'gallery',
        'gallery-id-here',
    ],
});
```

## Navigating Routes

To navigate to a new route, use the `.setRoute()` method. This will first sanitize your route, ensure that it properly includes `basePath`, and set it to the window URL:

<!-- example-link: src/readme-examples/route-navigation.example.ts -->

```TypeScript
import {myRouter} from './router-creation.example.js';

myRouter.setRoute({
    paths: [
        'gallery',
        'another-gallery-id',
    ],
});
```

Note that you can also use the method `.setRouteOnDirectNavigation()` to navigate to routes only if a given `MouseEvent` allows direct navigation. (Meaning, only if the user didn't try to open a link in a new tab or right click on the link.)
