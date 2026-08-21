import {check} from '@augment-vir/assert';
import {
    deepCopy,
    getObjectTypedEntries,
    mapObjectValues,
    type AnyObject,
    type EmptyObject,
    type IsEqual,
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
 * Converts a path tree into a nested object type.
 *
 * The `root` property represents the current path when it is valid as a bare path. The `children`
 * property contains entries for each known child path.
 *
 * @category Internal
 */
export type MappedPathTree<
    LeafValue,
    Tree extends Readonly<BasePathTree | EmptyObject>,
> = EmptyObject extends Tree
    ? Readonly<{
          root: LeafValue;
      }>
    : Tree extends Readonly<{
            children: infer Children extends object;
        }>
      ? keyof Children extends never
          ? Tree extends Readonly<{
                allowBare: true;
            }>
              ? Readonly<{
                    root: LeafValue;
                }>
              : EmptyObject
          : Tree extends Readonly<{
                  allowBare: true;
              }>
            ? Readonly<{
                  root: LeafValue;
                  children: MappedPathTreeChildren<LeafValue, Children>;
              }>
            : Readonly<{
                  children: MappedPathTreeChildren<LeafValue, Children>;
              }>
      : Tree extends Readonly<{
              allowBare: true;
          }>
        ? Readonly<{
              root: LeafValue;
          }>
        : EmptyObject;

/**
 * Helper for {@link MappedPathTree}.
 *
 * @category Internal
 */
export type MappedPathTreeChildren<LeafValue, Children extends object> = Readonly<{
    [Path in keyof Children]: MappedPathTree<
        LeafValue,
        Extract<Children[Path], Readonly<BasePathTree | EmptyObject>>
    >;
}>;

/**
 * Creates a {@link MappedPathTree} value for the given path tree.
 *
 * @category Main
 */
export function mapPathTree<LeafValue>() {
    return <const Tree extends Readonly<BasePathTree | EmptyObject>>(
        tree: Tree,
        mappedTree: MappedPathTree<LeafValue, Tree>,
    ) => {
        return mappedTree;
    };
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
            fill: (pathParam: string) => {
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
    public sanitizePaths(rawPaths: ReadonlyArray<string>): TreePaths<Tree> {
        return sanitizeTreePaths(rawPaths, this.tree) as TreePaths<Tree>;
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
