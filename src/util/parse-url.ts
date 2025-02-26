import {addPrefix, removePrefix} from '@augment-vir/common';
import {parseUrl} from 'url-vir';
import {FullSpaRoute} from '../spa-route.js';

/**
 * Parse the given URL into a `FullRoute` object.
 *
 * @category Internal
 */
export function parseUrlIntoRawRoute(
    url: string | URL,
    basePath?: string | undefined,
): FullSpaRoute {
    const urlParts = parseUrl(url);

    const pathToSplit = removePrefix({
        value: removePrefix({
            value: urlParts.pathname,
            prefix: addPrefix({value: basePath || '', prefix: '/'}),
        }),
        prefix: '/',
    });
    const paths = pathToSplit ? pathToSplit.split('/') : [];

    const search = Object.keys(urlParts.searchParams).length ? urlParts.searchParams : undefined;
    const hash = urlParts.hash ? removePrefix({value: urlParts.hash, prefix: '#'}) : undefined;

    return {
        paths,
        search,
        hash,
    };
}
