import {FullSpaRoute} from '../index.js';
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
