/* node:coverage disable */

import {css, defineElement, html} from 'element-vir';
import {noNativeSpacing, ViraCard, ViraLink} from 'vira';
import {PathTree, SpaRouter} from './index.js';

/**
 * Exercises every notable path-tree feature so the demo UI can demonstrate them:
 *
 * - `redirectFrom` with an exact entry (`start` -> `home`).
 * - `redirectFrom` with both exact and wildcard entries (`info` and `info/*` -> `about`).
 * - `redirectFrom` with a wildcard-only entry (`photos/*` -> `gallery/*`, `photos` alone falls
 *   through).
 * - `redirectTo` for sibling redirection (`legacy` -> `about`).
 * - A path parameter under a wildcard alias (`gallery/:photoId/view`).
 * - A disabled child that should be stripped during sanitization (`about/disabled`).
 * - An `anyChildren` branch that accepts arbitrary depth (`files/...`).
 */
export const demoPathTree = new PathTree({
    allowBare: true,
    children: {
        home: {
            allowBare: true,
            redirectFrom: ['start'],
            children: {},
        },
        gallery: {
            allowBare: true,
            redirectFrom: ['photos/*'],
            children: {
                ':photoId': {
                    allowBare: true,
                    children: {
                        view: {},
                    },
                },
            },
        },
        about: {
            allowBare: true,
            redirectFrom: [
                'info',
                'info/*',
            ],
            children: {
                team: {},
                contact: {},
                disabled: {
                    allowBare: true,
                    disable: true,
                    children: {},
                },
            },
        },
        legacy: {
            allowBare: true,
            redirectTo: 'about',
            children: {},
        },
        files: {
            anyChildren: true,
        },
    },
});

export const demoRouter = new SpaRouter({
    sanitizeRoute(rawRoute) {
        return {
            paths: demoPathTree.sanitizePaths(rawRoute.paths),
            search: undefined,
            hash: undefined,
        };
    },
});

type DemoLink = Readonly<{
    label: string;
    attempt: ReadonlyArray<string>;
}>;

type DemoSection = Readonly<{
    title: string;
    description: string;
    links: ReadonlyArray<DemoLink>;
}>;

const demoSections: ReadonlyArray<DemoSection> = [
    {
        title: 'Direct navigation',
        description: 'Paths that exist directly in the path tree.',
        links: [
            {
                label: '/ (bare root)',
                attempt: [],
            },
            {
                label: '/home',
                attempt: ['home'],
            },
            {
                label: '/gallery',
                attempt: ['gallery'],
            },
            {
                label: '/about',
                attempt: ['about'],
            },
            {
                label: '/about/team',
                attempt: [
                    'about',
                    'team',
                ],
            },
            {
                label: '/about/contact',
                attempt: [
                    'about',
                    'contact',
                ],
            },
        ],
    },
    {
        title: 'redirectFrom, exact aliases',
        description:
            'Each alias matches only the bare path. Descendants are not implicitly redirected.',
        links: [
            {
                label: '/start expected /home',
                attempt: ['start'],
            },
            {
                label: '/info expected /about',
                attempt: ['info'],
            },
        ],
    },
    {
        title: 'redirectFrom, wildcard aliases',
        description:
            'Aliases suffixed with /* match descendants and forward the remaining segments unchanged.',
        links: [
            {
                label: '/info/team expected /about/team',
                attempt: [
                    'info',
                    'team',
                ],
            },
            {
                label: '/info/contact expected /about/contact',
                attempt: [
                    'info',
                    'contact',
                ],
            },
            {
                label: '/photos/42 expected /gallery/42',
                attempt: [
                    'photos',
                    '42',
                ],
            },
            {
                label: '/photos/42/view expected /gallery/42/view',
                attempt: [
                    'photos',
                    '42',
                    'view',
                ],
            },
        ],
    },
    {
        title: 'redirectFrom, non-matches fall through to sanitization',
        description:
            'A wildcard alias does not match the bare path, and an exact alias does not match when descendants are present.',
        links: [
            {
                label: '/photos (wildcard requires more segments) expected /',
                attempt: ['photos'],
            },
            {
                label: '/start/extra (exact does not match with descendants) expected /',
                attempt: [
                    'start',
                    'extra',
                ],
            },
        ],
    },
    {
        title: 'redirectTo, sibling redirect',
        description: 'A node can redirect to one of its siblings, carrying any descendants along.',
        links: [
            {
                label: '/legacy expected /about',
                attempt: ['legacy'],
            },
            {
                label: '/legacy/team expected /about/team',
                attempt: [
                    'legacy',
                    'team',
                ],
            },
        ],
    },
    {
        title: 'Path parameters',
        description: ':photoId is a path parameter that accepts any string.',
        links: [
            {
                label: '/gallery/sunset',
                attempt: [
                    'gallery',
                    'sunset',
                ],
            },
            {
                label: '/gallery/sunset/view',
                attempt: [
                    'gallery',
                    'sunset',
                    'view',
                ],
            },
        ],
    },
    {
        title: 'Disabled paths',
        description: 'A child marked disable: true is stripped from the sanitized path.',
        links: [
            {
                label: '/about/disabled expected /about',
                attempt: [
                    'about',
                    'disabled',
                ],
            },
        ],
    },
    {
        title: 'anyChildren',
        description: 'A node with anyChildren accepts unbounded depth without validation.',
        links: [
            {
                label: '/files',
                attempt: ['files'],
            },
            {
                label: '/files/docs/readme.md',
                attempt: [
                    'files',
                    'docs',
                    'readme.md',
                ],
            },
            {
                label: '/files/a/b/c/d',
                attempt: [
                    'files',
                    'a',
                    'b',
                    'c',
                    'd',
                ],
            },
        ],
    },
    {
        title: 'Sanitization fallbacks',
        description: 'Unknown segments default to the closest valid ancestor (or the bare root).',
        links: [
            {
                label: '/nonsense expected /',
                attempt: ['nonsense'],
            },
            {
                label: '/gallery/sunset/unknown expected /gallery/sunset',
                attempt: [
                    'gallery',
                    'sunset',
                    'unknown',
                ],
            },
        ],
    },
];

function formatPath(paths: ReadonlyArray<string>): string {
    return paths.length ? '/' + paths.join('/') : '/';
}

export const VirDemo = defineElement()({
    tagName: 'vir-demo',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 760px;
            margin: 16px auto;
            box-sizing: border-box;
            font-family: sans-serif;
        }
        h2,
        h1,
        p {
            ${noNativeSpacing}
        }

        ${ViraCard} {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
    `,
    state() {
        return {
            currentRoute: demoRouter.readCurrentRoute(),
            removeListener: undefined as undefined | (() => void),
        };
    },
    init({updateState}) {
        updateState({
            removeListener: demoRouter.listen(false, (route) => {
                updateState({
                    currentRoute: route,
                });
            }),
        });
    },
    cleanup({state}) {
        state.removeListener?.();
    },
    render({state}) {
        return html`
            <h1>spa-router-vir demo</h1>
            <${ViraCard} class="current">
                <h2>Current route</h2>
                <p>
                    Sanitized URL:
                    <code>${formatPath(state.currentRoute.paths)}</code>
                </p>
            </${ViraCard}>
            ${demoSections.map(
                (section) => html`
                    <${ViraCard}>
                        <h2>${section.title}</h2>
                        <p>${section.description}</p>
                        ${section.links.map(
                            (link) => html`
                                <${ViraLink.assign({
                                    route: {
                                        route: {
                                            paths: link.attempt,
                                            hash: undefined,
                                            search: undefined,
                                        },
                                        router: demoRouter,
                                    },
                                })}>
                                    ${link.label}
                                </${ViraLink}>
                            `,
                        )}
                    </${ViraCard}>
                `,
            )}
        `;
    },
});
