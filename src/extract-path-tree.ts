import {type GenericTreePaths, type PathTree} from './path-tree.js';

/**
 * Extracts a child path tree that matches the given paths, or, if they don't match, returns
 * `undefined`.
 *
 * @category Main
 */
export function extractPathTree<const Tree extends Readonly<GenericTreePaths>>(
    currentPaths: ReadonlyArray<string>,
    root: PathTree<any> | Readonly<PathTree<any>>,
    /** The specific subtree of the root tree that you want to match. */
    subTree: Tree,
): Tree | undefined {
    let subTreeMatch: GenericTreePaths = root.paths;
    let progressTree: GenericTreePaths = root.paths;

    if (
        !currentPaths.every((currentPath, index) => {
            const expectedPath = subTree.fullPaths[index];

            const isPathEqual = expectedPath
                ? (currentPath && expectedPath.startsWith(':')) || currentPath === expectedPath
                : true;

            if (!isPathEqual) {
                return false;
            }

            const matchedTreeChild =
                !expectedPath?.startsWith(':') && progressTree.children?.[currentPath];

            if (matchedTreeChild) {
                progressTree = matchedTreeChild;
            } else {
                /** Handle the `:` case. */
                const anyMatchChildTree = Object.entries(
                    /* node:coverage ignore next 1 */
                    progressTree.children || {},
                ).find(
                    ([
                        key,
                    ]) => key.startsWith(':'),
                )?.[1];

                /* node:coverage ignore next 3: these lines shouldn't be hit but they're required for type guarding. */
                if (!anyMatchChildTree || !('fill' in anyMatchChildTree)) {
                    return false;
                }

                progressTree = anyMatchChildTree.fill(currentPath);
            }
            if (expectedPath) {
                subTreeMatch = progressTree;
            }

            return true;
        })
    ) {
        return undefined;
    }

    return subTreeMatch as Tree;
}
