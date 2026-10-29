import {check} from '@augment-vir/assert';
import {
    deepCopy,
    getObjectTypedEntries,
    mapObjectValues,
    type AnyObject,
    type EmptyObject,
    type IsEqual,
    type PartialWithUndefined,
    type RemoveLastTupleEntry,
    type Values,
} from '@augment-vir/common';

/**
 * Shared options for {@link BasePathTree}.
 *
 * @category Internal
 */
export type SharedPathTreeOptions = {
    /** Set to true to disable this route in sanitization. */
    disable?: boolean | undefined;
    /**
     * If set, sanitization will always set this path part to the value provided. All other path
     * parts (ancestors and children) will not be changed. This should be the name of a sibling tree
     * path.
     *
     * Note that at the top level of a path tree, this does nothing.
     */
    redirectTo?: string | undefined;
    /**
     * If set, sanitization will accept any of these path parts as an alias for this path. Each
     * entry is a single segment (an optional leading slash is allowed) that may be suffixed with
     * `/*` to also redirect descendants. The matched path part is rewritten to this node's own path
     * name.
     *
     * - `'old'` matches only the exact path `/old` (no descendants).
     * - `'old/*'` matches `/old/<anything>` and forwards the remaining segments unchanged. It does
     *   not match the bare `/old`.
     *
     * Both forms can be combined (e.g. `redirectFrom: ['old', 'old/*']`) to redirect both the bare
     * path and all descendants.
     */
    redirectFrom?: ReadonlyArray<string> | undefined;
};

/**
 * Base type for the constructor parameter tree in {@link PathTree}.
 *
 * @category Internal
 */
export type BasePathTree =
    | ({
          /** Set true to allow this path as a bare path (without any children). */
          allowBare: boolean;
          children?:
              | {
                    [Path in string]:
                        | BasePathTree
                        /**
                         * If a child path is an empty object, that means that it has no children
                         * and `allowBare` is set to `true`.
                         */
                        | EmptyObject;
                }
              | undefined;
          anyChildren?: never;
      } & SharedPathTreeOptions)
    | ({
          allowBare?: never;
          /** Set this to `true` to allow any nested paths (string[]). */
          anyChildren: true;
          children?: never;
      } & SharedPathTreeOptions);

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
                  [
                      Path extends `:${string}` ? string : Path,
                      ...TreePaths<Children[Path]>,
                  ]
              >;
          }>
        : Readonly<[]>;

/**
 * The tree produced by {@link PathTree.extend}: `Extension` deeply merged into `Base`, with
 * `Extension` winning on every option they both set.
 *
 * @category Internal
 */
export type ExtendedPathTree<
    Base extends Readonly<BasePathTree> | EmptyObject,
    Extension extends Readonly<BasePathTree> | EmptyObject,
> = EmptyObject extends Extension
    ? Base
    : EmptyObject extends Base
      ? Extension
      : Omit<Base, keyof Extension> &
            Omit<Extension, 'children'> & {
                children: ExtendedPathTreeChildren<
                    NonNullable<Exclude<Base, EmptyObject>['children']>,
                    NonNullable<Exclude<Extension, EmptyObject>['children']>
                >;
            };

/**
 * Nested part of {@link ExtendedPathTree}.
 *
 * @category Internal
 */
export type ExtendedPathTreeChildren<
    BaseChildren extends NonNullable<BasePathTree['children']>,
    ExtensionChildren extends NonNullable<BasePathTree['children']>,
> = {
    [Path in keyof BaseChildren | keyof ExtensionChildren]: Path extends keyof ExtensionChildren
        ? Path extends keyof BaseChildren
            ? ExtendedPathTree<BaseChildren[Path], ExtensionChildren[Path]>
            : ExtensionChildren[Path]
        : Path extends keyof BaseChildren
          ? BaseChildren[Path]
          : never;
};

function mergePathTrees({
    base,
    extension,
}: Readonly<{
    base: Readonly<BasePathTree | EmptyObject>;
    extension: Readonly<BasePathTree | EmptyObject>;
}>): BasePathTree | EmptyObject {
    if (check.isEmpty(extension)) {
        return base;
    } else if (check.isEmpty(base)) {
        return extension;
    }

    const baseChildren = (base as BasePathTree).children;
    const extensionChildren = (extension as BasePathTree).children;

    if (!baseChildren || !extensionChildren) {
        return {
            ...base,
            ...extension,
            children: baseChildren || extensionChildren,
        } as BasePathTree;
    }

    const children: NonNullable<BasePathTree['children']> = {
        ...baseChildren,
    };
    getObjectTypedEntries(extensionChildren).forEach(
        ([
            path,
            extensionChild,
        ]) => {
            const baseChild = baseChildren[path];
            children[path] = baseChild
                ? mergePathTrees({
                      base: baseChild,
                      extension: extensionChild,
                  })
                : extensionChild;
        },
    );

    return {
        ...base,
        ...extension,
        children,
    } as BasePathTree;
}

function checkTree(tree: Readonly<BasePathTree>, pathChain: string[]): void {
    const childrenEntries = Object.entries(tree.children || {});
    const parentString = pathChain.length ? ` at ${pathChain.join(' -> ')}.` : '.';

    if (tree.allowBare && (tree as BasePathTree).anyChildren) {
        throw new Error(
            `Invalid tree: cannot define both allowBare and anyChildren${parentString}`,
        );
    } else if (tree.anyChildren && childrenEntries.length) {
        throw new Error(
            `Invalid tree: cannot define anyChildren and definite children${parentString}`,
        );
    } else if (
        !tree.allowBare &&
        !tree.anyChildren &&
        !childrenEntries.some(([key]) => !key.startsWith(':'))
    ) {
        throw new Error(
            `Invalid tree: allowBare is false but there are no definite children${parentString}`,
        );
    } else if (!tree.anyChildren) {
        childrenEntries.forEach(
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
 * {@link RuntimeTreePaths} but only for sub-trees of path-param paths.
 *
 * @category Internal
 */
export type TreeWithParams<
    Tree extends Readonly<BasePathTree | EmptyObject>,
    OriginalTree extends Readonly<BasePathTree | EmptyObject>,
    CurrentPaths extends PropertyKey[],
    PathParam extends string,
> = EmptyObject extends Tree
    ? Readonly<{
          path: PathParam;
          fullPaths: Readonly<
              [
                  ...RemoveLastTupleEntry<CurrentPaths>,
                  PathParam,
              ]
          >;
          PathsType: Readonly<
              ValidPaths<
                  OriginalTree,
                  [
                      ...RemoveLastTupleEntry<CurrentPaths>,
                      PathParam,
                  ]
              >
          >;
      }>
    : Tree extends {anyChildren: true}
      ? Readonly<{
            path: PathParam;
            fullPaths: Readonly<
                [
                    ...RemoveLastTupleEntry<CurrentPaths>,
                    PathParam,
                ]
            >;
            PathsType: Readonly<
                ValidPaths<
                    OriginalTree,
                    [
                        ...RemoveLastTupleEntry<CurrentPaths>,
                        PathParam,
                    ]
                >
            >;
        }>
      : Readonly<{
            path: PathParam;
            fullPaths: Readonly<
                [
                    ...RemoveLastTupleEntry<CurrentPaths>,
                    PathParam,
                ]
            >;
            PathsType: Readonly<
                ValidPaths<
                    OriginalTree,
                    [
                        ...RemoveLastTupleEntry<CurrentPaths>,
                        PathParam,
                    ]
                >
            >;
            children: Readonly<{
                [ChildPath in keyof Exclude<Tree, EmptyObject>['children']]: RuntimeTreePaths<
                    Extract<Exclude<Tree, EmptyObject>['children'], AnyObject>[ChildPath],
                    OriginalTree,
                    [
                        ...RemoveLastTupleEntry<CurrentPaths>,
                        PathParam,
                        ChildPath,
                    ],
                    ChildPath
                >;
            }>;
        }>;

/**
 * Extend this to make each {@link mapPathTree} leaf's type depend on that leaf's paths. Read the
 * paths through `this['paths']` in your `leaf` type. If a leaf type passed to {@link mapPathTree}
 * does not extend this, it's used as-is for every leaf.
 *
 * Keep `paths` typed as `unknown` in extensions. Narrowing it (to `ReadonlyArray<string>`, for
 * example) intersects it with each leaf's paths tuple.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {type MappedPathTreeLeaf} from 'spa-router-vir';
 *
 * interface RouteRendererLeaf extends MappedPathTreeLeaf {
 *     readonly leaf: (paths: Extract<this['paths'], ReadonlyArray<string>>) => string;
 * }
 * ```
 */
export interface MappedPathTreeLeaf {
    readonly paths: unknown;
    readonly leaf: unknown;
}

/**
 * The leaf type for the given paths. See {@link MappedPathTreeLeaf}.
 *
 * @category Internal
 */
export type ApplyMappedPathTreeLeaf<Leaf, Paths> = Leaf extends MappedPathTreeLeaf
    ? (Leaf &
          Readonly<{
              paths: Paths;
          }>)['leaf']
    : Leaf;

/**
 * Converts a {@link PathTree.paths} node into a nested object type.
 *
 * The `root` property holds the value for the current path. It is required when the path is valid
 * as a bare path or when `children` is omitted. `children` may be omitted, in which case
 * {@link getMappedPathTreeValue} returns this node's `root` for every descendant path. When
 * `children` is provided, it must map every child path.
 *
 * Each `root` is typed with all valid paths at or below its node (see {@link MappedPathTreeLeaf}).
 *
 * @category Internal
 */
export type MappedPathTree<
    Leaf,
    TreePaths extends Readonly<Pick<GenericTreePaths, 'fullPaths' | 'PathsType'>>,
> =
    TreePaths extends Readonly<{
        children: infer Children extends object;
    }>
        ? EmptyObject extends Children
            ? Readonly<{
                  root: ApplyMappedPathTreeLeaf<Leaf, TreePaths['PathsType']>;
              }>
            : TreePaths['fullPaths'] extends TreePaths['PathsType']
              ? Readonly<{
                    root: ApplyMappedPathTreeLeaf<Leaf, TreePaths['PathsType']>;
                    children?: MappedPathTreeChildren<Leaf, Children> | undefined;
                }>
              :
                    | Readonly<{
                          root: ApplyMappedPathTreeLeaf<Leaf, TreePaths['PathsType']>;
                          children?: undefined;
                      }>
                    | Readonly<{
                          children: MappedPathTreeChildren<Leaf, Children>;
                      }>
        : Readonly<{
              root: ApplyMappedPathTreeLeaf<Leaf, TreePaths['PathsType']>;
          }>;

/**
 * Helper for {@link MappedPathTree}.
 *
 * @category Internal
 */
export type MappedPathTreeChildren<Leaf, Children extends object> = Readonly<{
    [Path in keyof Children]: Children[Path] extends Readonly<
        Pick<GenericTreePaths, 'fullPaths' | 'PathsType'>
    >
        ? MappedPathTree<Leaf, Children[Path]>
        : never;
}>;

/**
 * A generic mapped path tree that can represent a mapped tree from any path-tree definition.
 *
 * @category Internal
 */
export type GenericMappedPathTree<LeafValue> = Readonly<
    PartialWithUndefined<{
        root: LeafValue;
        children: Readonly<Record<string, GenericMappedPathTree<LeafValue>>>;
    }>
>;

/**
 * Output of {@link mapPathTree}. `LeafType` is only a type: it never exists at runtime.
 *
 * @category Internal
 */
export type MappedPathTreeOutput<
    Leaf,
    TreePaths extends Readonly<Pick<GenericTreePaths, 'fullPaths' | 'PathsType'>>,
> = MappedPathTree<Leaf, TreePaths> &
    Readonly<{
        LeafType?: Leaf;
    }>;

/**
 * Creates a {@link MappedPathTree} value for the given {@link PathTree.paths} node (the root `paths`
 * or any of its descendants).
 *
 * @category Main
 */
export function mapPathTree<Leaf>() {
    return <const TreePaths extends Readonly<Pick<GenericTreePaths, 'fullPaths' | 'PathsType'>>>(
        treePaths: TreePaths,
        mappedTree: MappedPathTree<Leaf, TreePaths>,
    ): MappedPathTreeOutput<Leaf, TreePaths> => {
        return mappedTree satisfies MappedPathTree<Leaf, TreePaths> as MappedPathTreeOutput<
            Leaf,
            TreePaths
        >;
    };
}

/**
 * Gets the root value in a mapped path tree that matches the given paths. When the walk reaches a
 * node that omits `children`, that node's `root` is returned for all remaining paths. A path that
 * doesn't match any of a node's provided `children` returns `undefined`.
 *
 * The output is typed for `currentPaths`. For a map of a sub-tree, `currentPaths` must only contain
 * the paths below that sub-tree, so pass the explicit generic paths if a {@link MappedPathTreeLeaf}
 * needs the full paths.
 *
 * @category Main
 */
export function getMappedPathTreeValue<Leaf, const CurrentPaths extends ReadonlyArray<string>>(
    currentPaths: CurrentPaths,
    mappedPathTree: Readonly<GenericMappedPathTree<unknown>> &
        Readonly<{
            LeafType?: Leaf;
        }>,
) {
    /**
     * The matched node's leaf is only typed for that node's paths. It's safe to type it with
     * `currentPaths` because `currentPaths` are what matched that node.
     */
    return findMappedPathTreeRoot(currentPaths, mappedPathTree) as
        | ApplyMappedPathTreeLeaf<Leaf, CurrentPaths>
        | undefined;
}

/** Recursion requires this explicit return type. */
function findMappedPathTreeRoot(
    currentPaths: ReadonlyArray<string>,
    mappedPathTree: Readonly<GenericMappedPathTree<unknown>>,
): unknown {
    if (!mappedPathTree.children || !check.isLengthAtLeast(currentPaths, 1)) {
        return mappedPathTree.root;
    }

    const [
        currentPath,
        ...remainingPaths
    ] = currentPaths;
    const childEntries = getObjectTypedEntries(mappedPathTree.children);
    const matchedChild = (childEntries.find(([childPath]) => {
        return childPath === currentPath;
    }) ||
        childEntries.find(([childPath]) => {
            return childPath.startsWith(':');
        }))?.[1];

    return matchedChild ? findMappedPathTreeRoot(remainingPaths, matchedChild) : undefined;
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
    ? TreeWithParams<Tree, OriginalTree, CurrentPaths, string> & {
          /** Fill the path param with a value. */
          fill: <PathParam extends string = string>(
              pathParam: PathParam,
          ) => TreeWithParams<Tree, OriginalTree, CurrentPaths, PathParam>;
      }
    : EmptyObject extends Tree
      ? Readonly<{
            path: CurrentPath;
            fullPaths: Readonly<CurrentPaths>;
            PathsType: Readonly<ValidPaths<OriginalTree, CurrentPaths>>;
            children: EmptyObject;
        }>
      : Tree extends {anyChildren: true}
        ? Readonly<{
              path: CurrentPath;
              fullPaths: Readonly<CurrentPaths>;
              PathsType: Readonly<ValidPaths<OriginalTree, CurrentPaths>>;
              children: EmptyObject;
          }>
        : Readonly<{
              path: CurrentPath;
              fullPaths: Readonly<CurrentPaths>;
              PathsType: Readonly<ValidPaths<OriginalTree, CurrentPaths>>;
              children: 'children' extends keyof Tree
                  ? Tree['children'] extends object
                      ? Readonly<{
                            [ChildPath in keyof Exclude<
                                Tree,
                                EmptyObject
                            >['children']]: RuntimeTreePaths<
                                Extract<
                                    Exclude<Tree, EmptyObject>['children'],
                                    AnyObject
                                >[ChildPath],
                                OriginalTree,
                                [
                                    ...CurrentPaths,
                                    ChildPath,
                                ],
                                ChildPath
                            >;
                        }>
                      : EmptyObject
                  : EmptyObject;
          }>;

/**
 * A generic version of {@link RuntimeTreePaths} that any {@link PathTree.paths} value can be assigned
 * to.
 *
 * @category Internal
 */
export type GenericTreePaths = Readonly<{
    /** Fills a path that has a path param. */
    fill?: (pathParam: string) => GenericTreePaths;
    path: string;
    fullPaths: ReadonlyArray<string>;
    PathsType: ReadonlyArray<string>;
    children?: Readonly<Record<string, GenericTreePaths>> | undefined;
}>;

/**
 * Remove all `PathsType` properties from a path tree.
 *
 * @category Internal
 */
export type RemovePathsTypes<Paths> =
    Paths extends ReadonlyArray<any>
        ? Paths
        : Paths extends (pathParam: string) => infer ReturnValue
          ? (pathParam: string) => RemovePathsTypes<ReturnValue>
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
    return deepCopy(paths) as RemovePathsTypes<Paths>;
}

/**
 * Extract all valid path string arrays for the current path.
 *
 * @category Internal
 */
export type ValidPaths<
    OriginalTree extends Readonly<BasePathTree> | EmptyObject,
    CurrentPaths extends PropertyKey[] = [],
> = Extract<
    TreePaths<OriginalTree>,
    Readonly<
        [
            ...CurrentPaths,
            ...string[],
        ]
    >
>;

function generatePathTreePaths<const Tree extends BasePathTree | EmptyObject>(
    tree: Readonly<Tree>,
    parentPaths: string[],
): RuntimeTreePaths<Tree> {
    const children: BasePathTree['children'] = (tree as AnyObject as BasePathTree).children;
    const currentPath = parentPaths[parentPaths.length - 1] || '';

    const generatedTree = Object.defineProperty(
        {
            path: currentPath,
            fullPaths: parentPaths,
            children:
                children && Object.keys(children).length
                    ? mapObjectValues(children, (childPath, childTree) => {
                          return generatePathTreePaths<BasePathTree | EmptyObject>(childTree, [
                              ...parentPaths,
                              childPath,
                          ]);
                      })
                    : {},
        },
        'PathsType',
        {
            enumerable: false,
            configurable: false,
            get() {
                throw new Error("Do not access PathsType as value, it's only a type.");
            },
        },
    ) as AnyObject as RuntimeTreePaths<Tree>;

    if (currentPath.startsWith(':')) {
        return {
            ...generatedTree,
            fill(pathParam: string) {
                return generatePathTreePaths(tree, [
                    ...parentPaths.slice(0, -1),
                    pathParam,
                ]);
            },
        } as any;
    }

    return generatedTree;
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
    public sanitizePaths(
        rawPaths: ReadonlyArray<string>,
        options?: Readonly<{
            passThroughUnknownTopLevelPaths?: false | undefined;
        }>,
    ): TreePaths<Tree>;
    /**
     * Sanitize the given paths to match this path tree, except that paths whose first part matches
     * none of this tree's top-level children (directly, through `redirectFrom`, or through a path
     * param) are returned untouched. Use this to sanitize only the routes this tree knows about
     * while leaving another tree's routes alone.
     */
    public sanitizePaths(
        rawPaths: ReadonlyArray<string>,
        options: Readonly<{
            passThroughUnknownTopLevelPaths: true;
        }>,
    ): TreePaths<Tree> | ReadonlyArray<string>;
    public sanitizePaths(
        rawPaths: ReadonlyArray<string>,
        options: Readonly<
            PartialWithUndefined<{
                passThroughUnknownTopLevelPaths: boolean;
            }>
        > = {},
    ): TreePaths<Tree> | ReadonlyArray<string> {
        if (
            options.passThroughUnknownTopLevelPaths &&
            check.isLengthAtLeast(rawPaths, 1) &&
            !findMatchingChildEntry(this.tree.children || {}, rawPaths[0], rawPaths.length > 1)
        ) {
            return rawPaths;
        }

        return sanitizeTreePaths(rawPaths, this.tree) as TreePaths<Tree>;
    }

    /**
     * Create a new {@link PathTree} with the given tree deeply merged into this one. Children
     * missing from this tree are added, children present in both are merged recursively, and every
     * other option set in `extension` overrides this tree's. This tree is not modified.
     *
     * @example
     *
     * ```ts
     * import {PathTree} from 'spa-router-vir';
     *
     * const publicPathTree = new PathTree({
     *     allowBare: true,
     *     children: {
     *         status: {
     *             allowBare: true,
     *             children: {
     *                 incidents: {},
     *             },
     *         },
     *     },
     * });
     *
     * const fullPathTree = publicPathTree.extend({
     *     allowBare: true,
     *     children: {
     *         status: {
     *             allowBare: true,
     *             children: {
     *                 'create-incident': {},
     *             },
     *         },
     *         settings: {},
     *     },
     * });
     * ```
     */
    public extend<const Extension extends Readonly<BasePathTree>>(
        extension: Extension,
    ): ExtendedPathTree<Tree, Extension> extends infer Extended extends Readonly<BasePathTree>
        ? PathTree<Extended>
        : never {
        return new PathTree<BasePathTree>(
            mergePathTrees({
                base: this.tree,
                extension,
            }) as BasePathTree,
        ) as any;
    }
}

function redirectFromEntryMatches({
    entry,
    pathPart,
    hasMoreSegments,
}: Readonly<{
    entry: string;
    pathPart: string;
    hasMoreSegments: boolean;
}>): boolean {
    const hasWildcard = entry.endsWith('/*');
    const rawBase = hasWildcard ? entry.slice(0, -2) : entry;
    const base = rawBase.startsWith('/') ? rawBase.slice(1) : rawBase;

    if (base !== pathPart) {
        return false;
    }

    return hasWildcard ? hasMoreSegments : !hasMoreSegments;
}

function findMatchingChildEntry(
    children: Readonly<Record<string, BasePathTree | EmptyObject>>,
    pathPart: string,
    hasMoreSegments: boolean,
):
    | readonly [
          string,
          BasePathTree | EmptyObject,
      ]
    | undefined {
    const directMatch = children[pathPart];
    if (directMatch) {
        return [
            pathPart,
            directMatch,
        ];
    }

    const redirectFromEntry = Object.entries(children).find(
        ([
            ,
            child,
        ]) => {
            return (
                'redirectFrom' in child &&
                child.redirectFrom?.some((entry) => {
                    return redirectFromEntryMatches({
                        entry,
                        pathPart,
                        hasMoreSegments,
                    });
                })
            );
        },
    );
    if (redirectFromEntry) {
        return redirectFromEntry;
    }

    return Object.entries(children).find(([key]) => key.startsWith(':'));
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
        const children = tree.children || {};

        if (check.isLengthAtLeast(rawPaths, 1)) {
            const currentPathPart = rawPaths[0];

            const matchedEntry = findMatchingChildEntry(
                children,
                currentPathPart,
                rawPaths.length > 1,
            );

            if (matchedEntry && !('disable' in matchedEntry[1] && matchedEntry[1].disable)) {
                const [
                    matchedKey,
                    matchedChild,
                ] = matchedEntry;

                if ('redirectTo' in matchedChild && matchedChild.redirectTo) {
                    const redirectedSibling = children[matchedChild.redirectTo];

                    if (!redirectedSibling) {
                        throw new Error(
                            `Invalid redirect from '${currentPathPart}' to '${matchedChild.redirectTo}'.`,
                        );
                    }

                    return sanitizeTreePaths(
                        [
                            matchedChild.redirectTo,
                            ...rawPaths.slice(1),
                        ],
                        tree,
                    );
                }

                const isPathParam = matchedKey.startsWith(':');
                const outputPathPart =
                    !isPathParam && matchedKey !== currentPathPart ? matchedKey : currentPathPart;

                return [
                    outputPathPart,
                    ...sanitizeTreePaths(rawPaths.slice(1), matchedChild),
                ];
            }
        }

        if (tree.allowBare) {
            return [];
        } else {
            /** If bare paths are not allowed but we got one. */
            const firstChild = getObjectTypedEntries(children).find(
                ([
                    key,
                    child,
                ]) => !key.startsWith(':') && !('disable' in child && child.disable),
            )?.[0];

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
