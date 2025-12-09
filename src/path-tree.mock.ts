import {PathTree} from './index.js';

export const mockPathTree = new PathTree({
    allowBare: true,
    children: {
        app: {
            allowBare: true,
            children: {
                uploads: {
                    allowBare: false,
                    children: {
                        patients: {
                            disable: true,
                            allowBare: true,
                        },
                        files: {
                            allowBare: true,
                            children: {
                                ':file-path': {
                                    allowBare: true,
                                    children: {
                                        view: {},
                                    },
                                },
                            },
                        },
                    },
                },
                settings: {
                    allowBare: true,
                    children: {
                        disabled: {
                            allowBare: true,
                            disable: true,
                            children: {},
                        },
                    },
                },
            },
        },
        withAny: {
            anyChildren: true,
        },
        legal: {},
    },
});
