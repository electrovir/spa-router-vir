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

globalThis.SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY = false;

// eslint-disable-next-line @typescript-eslint/unbound-method
const originalPushState = globalThis.history.pushState;
function newPushState(...args: any) {
    const originalResult = originalPushState.apply(globalThis.history, args);
    globalThis.dispatchEvent(new Event(globalLocationChangeEventName));
    return originalResult;
}

// eslint-disable-next-line @typescript-eslint/unbound-method
const originalReplaceState = globalThis.history.replaceState;
function newReplaceState(...args: any) {
    const originalResult = originalReplaceState.apply(globalThis.history, args);
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
    if (globalThis.SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY) {
        return;
        /* node:coverage disable */
    } else if (globalThis.history.pushState === newPushState) {
        throw new GlobalUrlEventsConsolidationError(
            `The consolidation module thinks that window events have not been consolidated yet but globalThis.history.pushState has already been overridden. Does this module have two copies in your repo?`,
        );
    } else if (globalThis.history.replaceState === newReplaceState) {
        throw new GlobalUrlEventsConsolidationError(
            `The consolidation module thinks that window events have not been consolidated yet but globalThis.history.replaceState has already been overridden. Does this module have two copies in your repo?`,
        );
    }
    /* node:coverage enable */
    globalThis.SPA_ROUTER_VIR_HISTORY_EVENTS_CONSOLIDATED_ALREADY = true;

    globalThis.history.pushState = newPushState;
    globalThis.history.replaceState = newReplaceState;

    globalThis.addEventListener('popstate', () => {
        globalThis.dispatchEvent(new Event(globalLocationChangeEventName));
    });
}
