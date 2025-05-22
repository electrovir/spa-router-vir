import {assert, check} from '@augment-vir/assert';
import {
    copyThroughJson,
    filterObject,
    mapObjectValues,
    type AnyObject,
    type Values,
} from '@augment-vir/common';
import {type EmptyObject, type IsEqual} from 'type-fest';

/**
 * Base type for the constructor parameter tree in {@link PathTree}.
 *
 * @category Internal
 */
export type BasePathTree =
    | {
          /** Set true to allow this path as a bare path (without any children). */
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
          anyChildren?: never;
      }
    | {
          allowBare?: never;
          /** Set this to `true` to allow any nested paths (string[]). */
          anyChildren: true;
          children?: never;
      };

/**
 * Converts a {@link PathTree} tree to a union of possible path arrays.
 *
 * @category Internal
 */
export type TreePaths<Tree extends Readonly<BasePathTree> | EmptyObject> = EmptyObject extends Tree
    ? Readonly<[]>
    : IsEqual<Exclude<Tree, EmptyObject>['anyChildren'], true> extends true
      ? Readonly<string[]>
      : Exclude<Tree, EmptyObject>['allowBare'] extends true
        ? Readonly<[]> | NestedTreePaths<Exclude<Tree, EmptyObject>>
        : NestedTreePaths<Exclude<Tree, EmptyObject>>;

/**
 * Nested part of {@link TreePaths}.
 *
 * @category Internal
 */
export type NestedTreePaths<NestedTree extends BasePathTree> =
    NestedTree['children'] extends infer Children extends NonNullable<BasePathTree['children']>
        ? Values<{
              [Path in keyof Children]: Readonly<
                  [Path extends `:${string}` ? string : Path, ...TreePaths<Children[Path]>]
              >;
          }>
        : Readonly<[]>;

function checkTree(tree: Readonly<BasePathTree>, pathChain: string[]): void {
    if (
        !tree.allowBare &&
        !tree.anyChildren &&
        !Object.keys(tree.children).some((key) => !key.startsWith(':'))
    ) {
        const parentString = pathChain.length ? ` on ${pathChain.join(' -> ')}.` : '.';
        throw new Error(
            `Invalid tree: allowBare is false but there are no definite children${parentString}`,
        );
    }

    if (!tree.anyChildren) {
        assert.isObject(
            tree.children,
            `expected children under ${pathChain.length ? pathChain[pathChain.length - 1] : 'top level'}`,
        );
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
}

/**
 * Generates the types for {@link PathTree.paths}.
 *
 * @category Internal
 */
export type RuntimeTreePaths<
    Tree extends Readonly<BasePathTree | EmptyObject>,
    OriginalTree extends Readonly<BasePathTree | EmptyObject> = Tree,
    CurrentPaths extends PropertyKey[] = [],
    CurrentPath extends PropertyKey = '',
> = CurrentPath extends `:${string}`
    ? EmptyObject extends Tree
        ? Readonly<EmptyObject>
        : Tree extends {anyChildren: true}
          ? Readonly<EmptyObject>
          : Readonly<{
                children: Readonly<{
                    [ChildPath in keyof Exclude<Tree, EmptyObject>['children']]: RuntimeTreePaths<
                        Extract<Exclude<Tree, EmptyObject>['children'], AnyObject>[ChildPath],
                        OriginalTree,
                        [...CurrentPaths, ChildPath],
                        ChildPath
                    >;
                }>;
            }>
    : EmptyObject extends Tree
      ? Readonly<{
            path: CurrentPath;
            fullPaths: Readonly<CurrentPaths>;
            PathsType: Readonly<ValidPaths<OriginalTree, CurrentPaths>>;
        }>
      : Tree extends {anyChildren: true}
        ? Readonly<{
              path: CurrentPath;
              fullPaths: Readonly<CurrentPaths>;
              PathsType: Readonly<ValidPaths<OriginalTree, CurrentPaths>>;
          }>
        : Readonly<{
              path: CurrentPath;
              fullPaths: Readonly<CurrentPaths>;
              PathsType: Readonly<ValidPaths<OriginalTree, CurrentPaths>>;
              children: Readonly<{
                  [ChildPath in keyof Exclude<Tree, EmptyObject>['children']]: RuntimeTreePaths<
                      Extract<Exclude<Tree, EmptyObject>['children'], AnyObject>[ChildPath],
                      OriginalTree,
                      [...CurrentPaths, ChildPath],
                      ChildPath
                  >;
              }>;
          }>;

/**
 * Remove all `PathsType` properties from a path tree.
 *
 * @category Internal
 */
export type RemovePathsTypes<Paths> =
    Paths extends ReadonlyArray<any>
        ? Paths
        : Paths extends Readonly<AnyObject>
          ? Omit<
                Readonly<{
                    [Key in keyof Paths]: RemovePathsTypes<Paths[Key]>;
                }>,
                'PathsType'
            >
          : Paths;

/**
 * Remove all `PathsType` properties from a path tree.
 *
 * @category Internal
 */
function removePathsTypes<Paths>(paths: Paths): RemovePathsTypes<Paths> {
    return copyThroughJson(paths) as RemovePathsTypes<Paths>;
}

/**
 * Extract all valid path string arrays for the current path.
 *
 * @category Internal
 */
export type ValidPaths<
    OriginalTree extends Readonly<BasePathTree> | EmptyObject,
    CurrentPaths extends PropertyKey[] = [],
> = Extract<TreePaths<OriginalTree>, Readonly<[...CurrentPaths, ...string[]]>>;

function generatePathTreePaths<const Tree extends BasePathTree | EmptyObject>(
    tree: Readonly<Tree>,
    parentPaths: string[],
): RuntimeTreePaths<Tree> {
    const children: BasePathTree['children'] | undefined = check.hasKey(tree, 'children')
        ? (tree.children as BasePathTree['children'])
        : undefined;
    const currentPath = parentPaths[parentPaths.length - 1] || '';
    const isPathParam = currentPath.startsWith(':');

    return Object.defineProperty(
        filterObject(
            {
                path: isPathParam ? undefined : currentPath,
                fullPaths: isPathParam ? undefined : parentPaths,
                children: children
                    ? mapObjectValues(children, (childPath, childTree) =>
                          generatePathTreePaths<BasePathTree | EmptyObject>(childTree, [
                              ...parentPaths,
                              childPath,
                          ]),
                      )
                    : undefined,
            },
            (key, value) => check.isDefined(value),
        ),
        'PathsType',
        {
            enumerable: false,
            configurable: false,
            get() {
                throw new Error("Do not access PathsType as value, it's only a type.");
            },
        },
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

    public readonly pathsWithoutTypes: RemovePathsTypes<RuntimeTreePaths<Tree>>;

    constructor(public readonly tree: Readonly<Tree>) {
        checkTree(this.tree, []);
        this.paths = generatePathTreePaths(tree, []);
        this.pathsWithoutTypes = removePathsTypes(this.paths);
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
): ReadonlyArray<string> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if ('anyChildren' in tree && tree.anyChildren) {
        return rawPaths;
    } else if ('allowBare' in tree) {
        if (check.isLengthAtLeast(rawPaths, 1)) {
            const matchedChild = tree.children[rawPaths[0]];

            if (matchedChild) {
                return [
                    rawPaths[0],
                    ...sanitizeTreePaths(rawPaths.slice(1), matchedChild),
                ];
            } else {
                const pathParamMatch = Object.entries(tree.children).find(([key]) =>
                    key.startsWith(':'),
                );

                if (pathParamMatch) {
                    return [
                        rawPaths[0],
                        ...sanitizeTreePaths(rawPaths.slice(1), pathParamMatch[1]),
                    ];
                }
            }
        }

        if (tree.allowBare) {
            return [];
        } else {
            /** If bare paths are not allowed but we got one. */
            const firstChild = Object.keys(tree.children).find((key) => !key.startsWith(':'));

            if (!firstChild) {
                throw new Error('Got blocked bare path but no children exist.');
            }

            return [firstChild];
        }
    } else {
        /** Empty object case, where at this point in the path tree there are definitely no children. */
        return [];
    }
}
