import {check} from '@augment-vir/assert';
import type {Values} from '@augment-vir/common';
import type {EmptyObject} from 'type-fest';
import type {FullRoute} from './full-route.js';

export type BasePathTree = {
    allowBare: boolean;
    children: {
        [Path in string]:
            | BasePathTree
            /**
             * If a child path is an empty object, that means that it has no children and
             * `allowBare` is set to `true`.
             */
            | EmptyObject;
    };
};

export type TreePaths<Tree extends Readonly<BasePathTree> | EmptyObject> = EmptyObject extends Tree
    ? []
    : Exclude<Tree, EmptyObject>['allowBare'] extends true
      ? [] | NestedTreePaths<Exclude<Tree, EmptyObject>>
      : NestedTreePaths<Exclude<Tree, EmptyObject>>;

export type NestedTreePaths<NestedTree extends BasePathTree> =
    NestedTree['children'] extends infer Children extends NonNullable<BasePathTree['children']>
        ? Values<{
              [Path in keyof Children]: [Path, ...TreePaths<Children[Path]>];
          }>
        : [];

function checkTree(tree: Readonly<BasePathTree>, pathChain: string[]): void {
    if (!tree.allowBare && !Object.keys(tree.children).length) {
        const parentString = pathChain.length ? ` on ${pathChain.join(' -> ')}.` : '.';
        throw new Error(
            `Invalid tree: allowBare is false but there are no children${parentString}`,
        );
    }

    Object.entries(tree.children).forEach(
        ([
            path,
            childTree,
        ]) => {
            if (!check.isEmpty(childTree)) {
                checkTree(childTree, [
                    ...pathChain,
                    path,
                ]);
            }
        },
    );
}

export class PathTree<const Tree extends Readonly<BasePathTree>> {
    constructor(public readonly tree: Readonly<Tree>) {
        checkTree(this.tree, []);
    }

    public get PathsType(): TreePaths<Tree> {
        throw new Error(
            'PathTree.PathsType is a type only, it cannot be accessed as a runtime value.',
        );
    }

    public sanitizePaths(rawRoute: Readonly<Pick<FullRoute, 'paths'>>): TreePaths<Tree> {
        return sanitizeTreePaths(rawRoute.paths, this.tree) as TreePaths<Tree>;
    }
}

export function sanitizeTreePaths(
    rawPaths: string[],
    tree: Readonly<BasePathTree | EmptyObject>,
): string[] {
    if ('allowBare' in tree) {
        if (check.isLengthAtLeast(rawPaths, 1)) {
            const matchedChild = tree.children[rawPaths[0]];

            if (matchedChild) {
                return [
                    rawPaths[0],
                    ...sanitizeTreePaths(rawPaths.slice(1), matchedChild),
                ];
            }
        }

        if (tree.allowBare) {
            return [];
        } else {
            /** If bare paths are not allowed but we got one. */
            const firstChild = Object.keys(tree.children)[0];

            if (!firstChild) {
                throw new Error('Got blocked bare path but no children exist.');
            }

            return [firstChild];
        }
    } else {
        return [];
    }
}
