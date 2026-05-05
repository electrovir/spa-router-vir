import {FullSpaRoute, SpaRouter} from '../index.js';

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
    | [
          'gallery',
          /** Specific gallery id. */ string,
      ]
    | ['about']
    | [
          'about',
          'team' | 'website',
      ];

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
