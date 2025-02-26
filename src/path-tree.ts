import {check} from '@augment-vir/assert';
import {filterObject, mapObjectValues, type AnyObject, type Values} from '@augment-vir/common';
import type {EmptyObject} from 'type-fest';

/**
 * Base type for the constructor parameter tree in {@link PathTree}.
 *
 * @category Internal
 */
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

/**
 * Converts a {@link PathTree} tree to a union of possible path arrays.
 *
 * @category Internal
 */
export type TreePaths<Tree extends Readonly<BasePathTree> | EmptyObject> = EmptyObject extends Tree
    ? []
    : Exclude<Tree, EmptyObject>['allowBare'] extends true
      ? [] | NestedTreePaths<Exclude<Tree, EmptyObject>>
      : NestedTreePaths<Exclude<Tree, EmptyObject>>;

/**
 * Nested part of {@link TreePaths}.
 *
 * @category Internal
 */
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

/**
 * Generates the types for {@link PathTree.paths}.
 *
 * @category Internal
 */
export type RuntimeTreePaths<
    Tree extends Readonly<BasePathTree | EmptyObject>,
    CurrentPaths extends PropertyKey[] = [],
    CurrentPath extends PropertyKey = '',
> = EmptyObject extends Tree
    ? Readonly<{
          path: CurrentPath;
          fullPaths: Readonly<CurrentPaths>;
      }>
    : (Exclude<Tree, EmptyObject>['allowBare'] extends true
          ? '' extends CurrentPath
              ? Readonly<{
                    fullPaths: Readonly<CurrentPaths>;
                }>
              : Readonly<{
                    path: CurrentPath;
                    fullPaths: Readonly<CurrentPaths>;
                }>
          : unknown) & {
          children: Readonly<{
              [ChildPath in keyof Exclude<Tree, EmptyObject>['children']]: RuntimeTreePaths<
                  Exclude<Tree, EmptyObject>['children'][ChildPath],
                  [...CurrentPaths, ChildPath],
                  ChildPath
              >;
          }>;
      };

function generatePathTreePaths<const Tree extends BasePathTree | EmptyObject>(
    tree: Readonly<Tree>,
    parentPaths: string[],
): RuntimeTreePaths<Tree> {
    const children: BasePathTree['children'] | undefined = check.hasKey(tree, 'children')
        ? (tree.children as BasePathTree['children'])
        : undefined;
    const allowBare = check.hasKey(tree, 'allowBare') ? tree.allowBare : true;

    return filterObject(
        {
            path: allowBare ? parentPaths[parentPaths.length - 1] : undefined,
            fullPaths: allowBare ? parentPaths : undefined,
            children: children
                ? mapObjectValues(children, (childPath, childTree) =>
                      generatePathTreePaths<BasePathTree | EmptyObject>(childTree, [
                          ...parentPaths,
                          childPath,
                      ]),
                  )
                : undefined,
        },
        (key, value) => check.isTruthy(value),
    ) as AnyObject as RuntimeTreePaths<Tree>;
}

/**
 * Easily create a tree of valid paths. Use {@link PathTree.sanitizePaths} in your router sanitizer
 * to verify paths.
 *
 * Note that a path tree can never have `allowBare: false` _and_ no children (`children: {}`) in the
 * same path. Doing so will throw an error in this class's constructor.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {SpaRouter, PathTree} from 'spa-router-vir';
 *
 * const myPathTree = new PathTree({
 *     allowBare: true,
 *     children: {
 *         'path-a': {},
 *         'path-b': {},
 *     },
 * });
 *
 * export const myRouter = new SpaRouter({
 *     sanitizeRoute(rawRoute) {
 *         return {
 *             paths: myPathTree.sanitizePaths(rawRoute.paths),
 *             hash: undefined,
 *             search: undefined,
 *         };
 *     },
 * });
 * ```
 */
export class PathTree<const Tree extends Readonly<BasePathTree>> {
    /**
     * A paths object for accessing the paths tree at runtime.
     *
     * @example
     *
     * ```ts
     * router.setRoute(myPathTree.paths['path-a'].fullPaths);
     * ```
     */
    public readonly paths: RuntimeTreePaths<Tree>;

    constructor(public readonly tree: Readonly<Tree>) {
        checkTree(this.tree, []);
        this.paths = generatePathTreePaths(tree, []);
    }

    /**
     * The `route.paths` type for this tree. Do not access this value at runtime (it will throw an
     * error), only use it as a type.
     *
     * @throws Any time its accessed as a runtime value.
     */
    public get PathsType(): TreePaths<Tree> {
        throw new Error(
            'PathTree.PathsType is a type only, it cannot be accessed as a runtime value.',
        );
    }

    /** Sanitize the given paths to match this path tree. */
    public sanitizePaths(rawPaths: ReadonlyArray<string>): TreePaths<Tree> {
        return sanitizeTreePaths(rawPaths, this.tree) as TreePaths<Tree>;
    }
}

/**
 * Sanitize a set of paths based on a given tree. This is used internally by {@link PathTree}.
 *
 * @category Internal
 */
export function sanitizeTreePaths(
    rawPaths: ReadonlyArray<string>,
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
