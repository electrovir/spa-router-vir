import {myRouter} from './router-creation.example.js';

document.getElementsByTagName('a')[0]!.href = myRouter.createRouteUrl({
    paths: [
        'gallery',
        'gallery-id-here',
    ],
}).url;
