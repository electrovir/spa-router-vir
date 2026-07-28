import {defineConfig} from '@virmator/test/configs/web-test-runner.config.base.mjs';
import {dirname} from 'path';
import {fileURLToPath, pathToFileURL} from 'url';

const baseConfig = defineConfig({
    coveragePercent: 100,
    packageRootDirPath: dirname(dirname(fileURLToPath(import.meta.url))),
    extraScreenshotOptions: {},
});

/** @type {import('@web/test-runner').TestRunnerConfig} */
const webTestRunnerConfig = {
    ...baseConfig,
    coverageConfig: {
        ...baseConfig.coverageConfig,
        exclude: [
            ...baseConfig.coverageConfig.exclude,
            /**
             * The demo element imports `vira`, which has a circular import through `theme-vir` ->
             * `element-book` -> `vira` that throws a `viraTheme` TDZ error when loaded outside of a
             * bundler. Nothing here is tested, so keep it out of the generated
             * all-files-for-code-coverage test.
             */
            '**/vir-demo.element.mock.ts',
        ],
    },
};

export default webTestRunnerConfig;

/** Log the full config if this file file is run directly as a script, for debugging. */
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    console.info(JSON.stringify(webTestRunnerConfig, null, 4));
}
