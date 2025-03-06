import {GlobalUrlEventsConsolidationError} from '../errors/consolidation.error.js';

/**
 * The event name that all global URL events are rewritten to emit.
 *
 * @category Internal
 */
export const globalLocationChangeEventName = 'locationchange';

declare global {
    // eslint-disable-next-line no-var
    var SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY: boolean;
}

/**
 * Support using this in Node.js, where `history` is not present (so routes can be shared between
 * frontend and backend).
 */
const globalHistory = globalThis.history as typeof globalThis.history | undefined;

globalThis.SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY = false;

// eslint-disable-next-line @typescript-eslint/unbound-method
const originalPushState = globalHistory?.pushState;
function newPushState(...args: any) {
    /* node:coverage ignore next 3 */
    if (!originalPushState) {
        return;
    }
    const originalResult = originalPushState.apply(globalHistory, args);
    globalThis.dispatchEvent(new Event(globalLocationChangeEventName));
    return originalResult;
}

// eslint-disable-next-line @typescript-eslint/unbound-method
const originalReplaceState = globalHistory?.replaceState;
function newReplaceState(...args: any) {
    /* node:coverage ignore next 3 */
    if (!originalReplaceState) {
        return;
    }
    const originalResult = originalReplaceState.apply(globalHistory, args);
    globalThis.dispatchEvent(new Event(globalLocationChangeEventName));
    return originalResult;
}

/**
 * Consolidate all types of url changes to `routeChangeEventName` events.
 *
 * @category Internal
 */
export function consolidateGlobalUrlEvents() {
    /** This should only ever be executed once. */
    if (globalThis.SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY || !globalHistory) {
        return;
        /* node:coverage disable */
    } else if (globalHistory.pushState === newPushState) {
        throw new GlobalUrlEventsConsolidationError(
            `The consolidation module thinks that window events have not been consolidated yet but globalHistory.pushState has already been overridden. Does this module have two copies in your repo?`,
        );
    } else if (globalHistory.replaceState === newReplaceState) {
        throw new GlobalUrlEventsConsolidationError(
            `The consolidation module thinks that window events have not been consolidated yet but globalHistory.replaceState has already been overridden. Does this module have two copies in your repo?`,
        );
    }
    /* node:coverage enable */
    globalThis.SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY = true;

    globalHistory.pushState = newPushState;
    globalHistory.replaceState = newReplaceState;

    globalThis.addEventListener('popstate', () => {
        globalThis.dispatchEvent(new Event(globalLocationChangeEventName));
    });
}
