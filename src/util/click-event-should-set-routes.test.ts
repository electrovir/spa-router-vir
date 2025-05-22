import {assert, waitUntil} from '@augment-vir/assert';
import {type MaybePromise, awaitedForEach} from '@augment-vir/common';
import {describe, itCases, testWeb} from '@augment-vir/test';
import {getCenterOfElement} from '@augment-vir/web';
import {sendKeys, sendMouse} from '@web/test-runner-commands';
import {type ClickPayload} from '@web/test-runner-commands/dist/sendMousePlugin';
import {css, html, listen} from 'element-vir';
import {shouldClickEventTriggerRouteChange} from './click-event-should-set-routes.js';

describe(shouldClickEventTriggerRouteChange.name, () => {
    type Action =
        | {
              type: 'click';
              button: NonNullable<ClickPayload['button']>;
          }
        | {
              type: 'key-down';
              /** Should be a modifier key `.key` name. */
              key: string;
          };

    async function testShouldClickEventTriggerRouteChange(
        actions: ReadonlyArray<Readonly<Action>>,
    ) {
        let result: boolean | undefined;

        const element = await testWeb.render(html`
            <div
                style=${css`
                    height: 200px;
                    width: 200px;
                `}
                ${listen('contextmenu', (event) => {
                    event.preventDefault();
                    return false;
                })}
                ${listen('mousedown', (event) => {
                    result = shouldClickEventTriggerRouteChange(event);
                })}
            ></div>
        `);

        assert.instanceOf(element, HTMLDivElement);

        const cleanupCallbacks: (() => MaybePromise<void>)[] = [];

        await awaitedForEach(actions, async (action) => {
            if (action.type === 'click') {
                const center = getCenterOfElement(element);
                await sendMouse({
                    type: 'move',

                    position: [
                        center.x,
                        center.y,
                    ],
                });

                await sendMouse({
                    type: 'down',
                    button: action.button,
                });

                cleanupCallbacks.push(async () => {
                    await sendMouse({
                        type: 'up',
                        button: action.button,
                    });
                });

                await waitUntil.isNotUndefined(
                    () => result,
                    {
                        timeout: {
                            milliseconds: 500,
                        },
                    },
                    'result never got calculated',
                );
            } else if ((action.type as string) === 'key-down') {
                await sendKeys({
                    down: action.key,
                });

                cleanupCallbacks.push(async () => {
                    await sendKeys({up: action.key});
                });
            }
        });

        await awaitedForEach(cleanupCallbacks, async (cleanupCallback) => {
            await cleanupCallback();
        });

        return result;
    }

    itCases(testShouldClickEventTriggerRouteChange, [
        {
            it: 'does nothing is no actions were provided to the test function',
            input: [],
            expect: undefined,
        },
        {
            it: 'accepts a regular left click',
            input: [
                {
                    type: 'click',
                    button: 'left',
                },
            ],
            expect: true,
        },
        {
            it: 'rejects a right click',
            input: [
                {
                    type: 'click',
                    button: 'right',
                },
            ],
            expect: false,
        },
        {
            it: 'rejects a shift+click',
            input: [
                {
                    type: 'key-down',
                    key: 'Shift',
                },
                {
                    type: 'click',
                    button: 'left',
                },
            ],
            expect: false,
        },
        {
            it: 'rejects a cmd+click',
            input: [
                {
                    type: 'key-down',
                    key: 'Meta',
                },
                {
                    type: 'click',
                    button: 'left',
                },
            ],
            expect: false,
        },
        {
            it: 'rejects a alt+click',
            input: [
                {
                    type: 'key-down',
                    key: 'Alt',
                },
                {
                    type: 'click',
                    button: 'left',
                },
            ],
            expect: false,
        },
        {
            it: 'rejects a ctrl+click',
            input: [
                {
                    type: 'key-down',
                    key: 'Control',
                },
                {
                    type: 'click',
                    button: 'left',
                },
            ],
            expect: false,
        },
    ]);
});
