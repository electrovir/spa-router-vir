/** 0 is left click and the default mouse button value if none were read. */
const LeftClickButton = 0;

/**
 * Detects if the user was trying to do something special with a link, like opening it in a new tab,
 * rather than trying to directly navigate to the link.
 *
 * @category Internal
 * @returns `true` if the user was intending to directly navigate to a link. `false` if the user was
 *   trying to do something special with the link.
 */
export function shouldClickEventTriggerRouteChange(
    mouseEvent: Readonly<
        Pick<MouseEvent, 'type' | 'altKey' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'button'>
    >,
): boolean {
    return !(
        (mouseEvent.type !== 'click' && mouseEvent.type !== 'mousedown') ||
        /**
         * Do not trigger a route update if a modifier key was held because the user was intending
         * to do something else, such as open the right click menu or open the link in a new tab.
         */
        mouseEvent.metaKey ||
        mouseEvent.altKey ||
        mouseEvent.ctrlKey ||
        mouseEvent.shiftKey ||
        /** Only route on left click, or if no click button was able to be read. */
        mouseEvent.button !== LeftClickButton
    );
}
